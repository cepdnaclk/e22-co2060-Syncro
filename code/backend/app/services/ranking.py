import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.models import Bid, Listing, Review, NotifiedSeller
from .seller_filter import apply_hard_filters, _get_keywords

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
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.seller_id == seller_id).scalar()
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


def run_pipeline(buyer, bid_request, db: Session, exclude_seller_ids: set[int] | None = None) -> list[tuple[int, float, str]]:
    """
    Master pipeline executing Stages 1, 2, and 3.
    Returns the list of 15 selected sellers to be notified.
    """
    # Stage 1: Hard Filters
    matched_seller_ids = apply_hard_filters(buyer, bid_request, db, exclude_seller_ids)

    # Stage 2: Relevance Scoring
    scored_pool = []
    for seller_id in matched_seller_ids:
        score = score_seller(seller_id, bid_request, db)
        scored_pool.append((seller_id, score))

    # Stage 3: Selection
    selected_sellers = select_notified_sellers(scored_pool)

    return selected_sellers
