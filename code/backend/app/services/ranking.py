import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.models import Bid, Listing, Review, NotifiedSeller
from .seller_filter import apply_hard_filters, _get_keywords, get_districts_by_proximity

def score_seller(seller_id: int, bid_request, db: Session) -> float:
    """
    Stage 2: Relevance Scoring
    Calculates a quality score using weighted factors:
    - 30 pts: Average rating
    - 20 pts: Specialty depth
    - 15 pts: Response speed
    - 10 pts: Recent activity
    """
    score = 0.0

    # 1. Average Rating (30 pts)
    # 30 * (avg_rating / 5)
    # If no reviews, mid-range (15 pts)
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.reviewee_id == seller_id).scalar()
    if avg_rating is not None:
        score += float(avg_rating) / 5.0 * 30.0
    else:
        score += 15.0

    # 2. Specialty depth (20 pts)
    # Exact category listing -> 20; keyword-only match -> 10
    specialty_pts = 10.0
    if bid_request.category_id:
        has_listing = db.query(Listing).filter(
            Listing.seller_id == seller_id,
            Listing.category_id == bid_request.category_id
        ).first()
        if has_listing:
            specialty_pts = 20.0
    score += specialty_pts

    # 3. Response speed (15 pts)
    # Based on past bids: avg time from notification to bid submission.
    # Join Bid and NotifiedSeller on bid_request_id and seller_id.
    past_responses = db.query(Bid.created_at, NotifiedSeller.notified_at).join(
        NotifiedSeller, 
        (Bid.seller_id == NotifiedSeller.seller_id) & (Bid.bid_request_id == NotifiedSeller.bid_request_id)
    ).filter(Bid.seller_id == seller_id).all()

    if past_responses:
        total_seconds = 0
        valid_responses = 0
        for bid_time, notif_time in past_responses:
            if bid_time and notif_time:
                diff = (bid_time - notif_time).total_seconds()
                if diff > 0:
                    total_seconds += diff
                    valid_responses += 1
        
        if valid_responses > 0:
            avg_seconds = total_seconds / valid_responses
            avg_hours = avg_seconds / 3600.0
            if avg_hours <= 1:
                score += 15.0
            elif avg_hours <= 4:
                score += 10.0
            elif avg_hours <= 24:
                score += 5.0
            else:
                score += 0.0
        else:
            score += 7.5  # No valid timing data, give mid-range
    else:
        score += 7.5  # No past bids, give mid-range

    # 4. Recent activity (10 pts)
    # Count of bids submitted in last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_bids_count = db.query(func.count(Bid.id)).filter(
        Bid.seller_id == seller_id,
        Bid.created_at >= thirty_days_ago
    ).scalar() or 0

    score += min(10.0, float(recent_bids_count))  # 1 pt per bid, capped at 10

    return score


def select_notified_sellers(scored_pool: list[tuple[int, float]]) -> list[tuple[int, float, str]]:
    """
    Stage 3: Notification Cap & Fairness Rotation
    Selects exactly 15 sellers:
    - Top 10 by score (Performance slots)
    - 5 random from the remaining (Fairness slots)
    Returns: list of (seller_id, score, slot_type)
    """
    # Sort pool descending by score
    scored_pool.sort(key=lambda x: x[1], reverse=True)

    selected = []
    
    # Take top 10 for performance slots
    performance_sellers = scored_pool[:10]
    for seller_id, score in performance_sellers:
        selected.append((seller_id, score, "performance"))
        
    remaining_pool = scored_pool[10:]
    
    # Take up to 5 for fairness slots (random)
    num_fairness = min(5, len(remaining_pool))
    if num_fairness > 0:
        fairness_sellers = random.sample(remaining_pool, num_fairness)
        for seller_id, score in fairness_sellers:
            selected.append((seller_id, score, "fairness"))

    return selected


# Minimum number of Stage-1 candidates required before Stage 3 selection runs.
# If fewer than this are found in the buyer's district the pipeline expands
# outward to neighbouring districts ring-by-ring until this threshold is met.
PIPELINE_MIN_SELLERS = 15


def run_pipeline(
    buyer,
    bid_request,
    db: Session,
    exclude_seller_ids: set[int] | None = None,
) -> list[tuple[int, float, str]]:
    """
    Master pipeline executing Stages 1, 2, and 3, with a proximity-fallback
    expansion for Stage 1's location filter.

    Stage 1 — Hard Filters (with expanding radius):
        The pipeline first tries to find sellers in the exact district the
        buyer requested.  If fewer than PIPELINE_MIN_SELLERS pass all three
        hard filters, it expands the search to the immediately adjacent
        districts (BFS hop 1), then their neighbours (hop 2), and so on,
        until enough sellers are collected or all Sri Lanka districts have
        been searched.

        Sellers found in closer districts are always included; the expansion
        only *adds* more districts — it never removes previously accepted
        sellers.

    Stage 2 — Relevance Scoring:
        Every seller that survived Stage 1 (across all expanded districts) is
        assigned a composite quality score.

    Stage 3 — Notification Cap & Fairness Rotation:
        Selects exactly 15 sellers: top 10 by score + 5 random fairness slots.

    Returns
    -------
    list of (seller_id, score, slot_type) tuples, max length 15.
    """
    # ── Stage 1: Hard Filters with proximity-fallback expansion ─────────────────
    #
    # Get all districts ordered nearest-first from the buyer's requested location.
    # Example for Kandy: ["kandy", "badulla", "kegalle", "kurunegala", "matale",
    #                     "nuwara eliya", "anuradhapura", "colombo", ...]
    ordered_districts = get_districts_by_proximity(bid_request.location)

    # Build the allowed-districts set incrementally.  We add districts one
    # BFS-ring at a time and re-run apply_hard_filters with the growing set.
    # Because apply_hard_filters returns *all* sellers in the allowed set
    # (not just the newly added ones) we simply replace matched_seller_ids
    # each iteration — there is no risk of duplicates.
    allowed_districts: set[str] = set()
    matched_seller_ids: list[int] = []
    ring_start = 0  # index into ordered_districts for the next ring to add

    while ring_start < len(ordered_districts):
        # Determine the BFS hop-level of the district at ring_start so we can
        # add all districts at the same hop distance in a single iteration
        # (avoids partial ring additions that would feel arbitrary).
        current_hop_district = ordered_districts[ring_start]

        # Collect all districts that belong to the same hop level by walking
        # forward until we hit a district that is a neighbour of a district
        # already in the set (i.e., belongs to the next hop level).
        # Simpler approach: just add one district at a time and let BFS
        # ordering guarantee correctness — each ordered_districts entry is
        # already in ascending hop-distance order.
        allowed_districts.add(current_hop_district)
        ring_start += 1

        # Re-run Stage 1 with the updated allowed set
        matched_seller_ids = apply_hard_filters(
            buyer,
            bid_request,
            db,
            exclude_seller_ids,
            allowed_districts=allowed_districts,
        )

        if len(matched_seller_ids) >= PIPELINE_MIN_SELLERS:
            # Enough sellers found — stop expanding
            break

    # ── Stage 2: Relevance Scoring ───────────────────────────────────────────────
    scored_pool: list[tuple[int, float]] = []
    for seller_id in matched_seller_ids:
        score = score_seller(seller_id, bid_request, db)
        scored_pool.append((seller_id, score))

    # ── Stage 3: Selection ───────────────────────────────────────────────────────
    selected_sellers = select_notified_sellers(scored_pool)

    return selected_sellers
