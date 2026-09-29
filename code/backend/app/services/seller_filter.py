"""
seller_filter.py — Stage 1: Hard Filters for Bid Notification Pipeline

When a buyer posts a bid request the system must decide which sellers to notify.
This module implements three binary pass/fail filters applied in sequence to
eliminate clearly unqualified sellers *before* any notification is issued.

Filter order (cheapest-to-most-expensive first):
  1. Active status  — profile.is_active must be True (or unset/NULL)
  2. Category/keyword match — seller must be relevant to the request category
  3. Location match — seller district must be within the allowed set of districts

Location Proximity Fallback (new in Stage 1.3):
  apply_hard_filters() accepts an `allowed_districts` set.  run_pipeline() in
  ranking.py starts with only the buyer's own district in that set and expands
  it ring-by-ring (using get_districts_by_proximity) until enough sellers are
  found to satisfy the pipeline (≥15 candidates before Stage 3 selection).

Only sellers who pass ALL three filters are returned.
"""

import re
from collections import deque
from sqlalchemy.orm import Session


# ── Sri Lanka Districts ───────────────────────────────────────────────────────
# Canonical district names used for location normalisation.
_SRI_LANKA_DISTRICTS = {
    "ampara", "anuradhapura", "badulla", "batticaloa", "colombo",
    "galle", "gampaha", "hambantota", "jaffna", "kalutara", "kandy",
    "kegalle", "kilinochchi", "kurunegala", "mannar", "matale",
    "matara", "monaragala", "mullaitivu", "nuwara eliya", "polonnaruwa",
    "puttalam", "ratnapura", "trincomalee", "vavuniya",
}


# ── District Adjacency Map ────────────────────────────────────────────────────
# Each key maps to the set of districts that directly share a border with it.
# Used by get_districts_by_proximity() to perform a BFS expansion.
_DISTRICT_NEIGHBOURS: dict[str, set[str]] = {
    "ampara":       {"batticaloa", "polonnaruwa", "monaragala", "badulla"},
    "anuradhapura": {"kurunegala", "puttalam", "mannar", "vavuniya",
                     "polonnaruwa", "matale"},
    "badulla":      {"kandy", "nuwara eliya", "monaragala", "ampara",
                     "matale"},
    "batticaloa":   {"ampara", "polonnaruwa", "trincomalee"},
    "colombo":      {"gampaha", "kalutara", "kegalle"},
    "galle":        {"matara", "kalutara", "ratnapura"},
    "gampaha":      {"colombo", "kurunegala", "kegalle", "puttalam"},
    "hambantota":   {"matara", "monaragala"},
    "jaffna":       {"kilinochchi"},
    "kalutara":     {"colombo", "galle", "ratnapura"},
    "kandy":        {"matale", "nuwara eliya", "kegalle", "kurunegala",
                     "badulla"},
    "kegalle":      {"colombo", "gampaha", "kandy", "kurunegala", "ratnapura"},
    "kilinochchi":  {"jaffna", "mannar", "mullaitivu", "vavuniya"},
    "kurunegala":   {"anuradhapura", "gampaha", "kandy", "kegalle",
                     "matale", "puttalam"},
    "mannar":       {"anuradhapura", "kilinochchi", "vavuniya"},
    "matale":       {"anuradhapura", "kandy", "kurunegala", "badulla",
                     "polonnaruwa", "trincomalee"},
    "matara":       {"galle", "hambantota", "ratnapura"},
    "monaragala":   {"ampara", "badulla", "hambantota", "polonnaruwa"},
    "mullaitivu":   {"kilinochchi", "trincomalee", "vavuniya"},
    "nuwara eliya": {"kandy", "badulla", "ratnapura", "matale"},
    "polonnaruwa":  {"ampara", "anuradhapura", "batticaloa", "matale",
                     "monaragala", "trincomalee"},
    "puttalam":     {"anuradhapura", "gampaha", "kurunegala"},
    "ratnapura":    {"galle", "kalutara", "kegalle", "matara",
                     "monaragala", "nuwara eliya"},
    "trincomalee":  {"batticaloa", "matale", "mullaitivu", "polonnaruwa"},
    "vavuniya":     {"anuradhapura", "kilinochchi", "mannar", "mullaitivu"},
}


def get_districts_by_proximity(origin_district: str | None) -> list[str]:
    """
    Return all Sri Lanka districts ordered from nearest to furthest relative
    to `origin_district`, using a Breadth-First Search (BFS) over the
    _DISTRICT_NEIGHBOURS adjacency graph.

    The origin district itself is first in the returned list (hop distance 0).
    Districts that share a border come next (hop distance 1), then their
    neighbours that haven't been visited yet (hop distance 2), and so on.

    If `origin_district` is None, unrecognised, or not in the district list,
    the function returns all districts in arbitrary order so the pipeline can
    still function without location data.

    Parameters
    ----------
    origin_district : str | None
        The district the buyer requested, as stored in BidRequest.location.
        Will be normalised (lower-case, stripped) internally.

    Returns
    -------
    list[str]
        All 25 canonical district names ordered nearest-first from the origin.
    """
    normalised = _normalise_location(origin_district)

    if not normalised or normalised not in _DISTRICT_NEIGHBOURS:
        # Unknown / missing location — return all districts in arbitrary order
        return list(_SRI_LANKA_DISTRICTS)

    ordered: list[str] = []
    visited: set[str] = set()
    queue: deque[str] = deque([normalised])
    visited.add(normalised)

    while queue:
        current = queue.popleft()
        ordered.append(current)
        for neighbour in sorted(_DISTRICT_NEIGHBOURS.get(current, set())):
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append(neighbour)

    # Append any districts not reachable via the graph (safety net)
    for district in _SRI_LANKA_DISTRICTS:
        if district not in visited:
            ordered.append(district)

    return ordered


def _normalise_location(location: str | None) -> str | None:
    """Lower-case and strip a location string; return None if empty/absent."""
    if not location:
        return None
    return location.strip().lower()


def _get_keywords(text: str | None) -> set[str]:
    """Extract meaningful keywords from text, removing common stop words."""
    if not text:
        return set()
    stop_words = {
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
        "for", "with", "by", "of", "is", "are", "was", "were", "i", "we",
        "you", "they", "it", "this", "that", "want", "need", "looking",
        "buy", "sell", "get", "make", "some", "any",
    }
    words = re.findall(r'\b\w+\b', text.lower())
    return {w for w in words if w not in stop_words and len(w) > 2}


# ── Individual Filter Functions ───────────────────────────────────────────────

def is_profile_active(profile) -> bool:
    """
    Hard Filter 2 — Account/profile active status.

    Returns False only when `profile.is_active` is explicitly set to False.
    NULL / not-set (None) is treated as active for backward compatibility
    with profiles created before the is_active column was added.
    """
    return getattr(profile, "is_active", None) is not False


def category_or_keyword_match(
    seller_id: int,
    category_id: int | None,
    request_keywords: set[str],
    profile,
    db: Session,
) -> bool:
    """
    Hard Filter 1 — Category / keyword relevance.

    A seller passes if EITHER:
      (a) They have at least one listing in the requested category, OR
      (b) Their profile name + description shares ≥1 keyword with the request.
    """
    from ..models.models import Listing

    # (a) Direct category listing match — fast DB check
    if category_id:
        has_listing = (
            db.query(Listing)
            .filter(
                Listing.seller_id == seller_id,
                Listing.category_id == category_id,
            )
            .first()
        )
        if has_listing:
            return True

    # (b) Keyword overlap with seller's profile text
    profile_text = f"{profile.name or ''} {profile.description or ''}"
    profile_keywords = _get_keywords(profile_text)
    
    # Exact overlap
    if request_keywords & profile_keywords:
        return True
        
    # Substring / plural overlap
    for r_kw in request_keywords:
        for p_kw in profile_keywords:
            if r_kw in p_kw or p_kw in r_kw:
                return True
                
    return False


def location_match(request_location: str | None, seller_location: str | None) -> bool:
    """
    Hard Filter 3 — Sri Lanka district matching (strict mode, single district).

    Compares the location the buyer specified through the AI assistant
    (stored in BidRequest.location) against the seller's static stored location
    (User.location set during registration / profile settings).

    Both sides are normalised to lowercase and compared directly.
    Returns False if either side has no location set, or if they differ.
    This ensures only sellers provably in the buyer's requested district are notified.
    """
    request = _normalise_location(request_location)
    seller = _normalise_location(seller_location)

    # Strict: both must be present and equal
    if not request or not seller:
        return False

    return request == seller


def location_match_any(
    seller_location: str | None,
    allowed_districts: set[str],
) -> bool:
    """
    Hard Filter 3 (multi-district variant) — used by the proximity-fallback path.

    Returns True when the seller's normalised district is present in the
    `allowed_districts` set.  The set is built iteratively by run_pipeline()
    and grows ring-by-ring (BFS hop distance) until enough sellers are found.

    Parameters
    ----------
    seller_location   : raw location string stored on the seller's User record
    allowed_districts : set of normalised district names currently in scope

    Returns
    -------
    bool — True if the seller is in any of the currently allowed districts.
    """
    seller = _normalise_location(seller_location)
    if not seller or not allowed_districts:
        return False
    return seller in allowed_districts


# ── Master Pipeline Function ──────────────────────────────────────────────────

def apply_hard_filters(
    buyer,
    bid_request,
    db: Session,
    exclude_seller_ids: set[int] | None = None,
    allowed_districts: set[str] | None = None,
) -> list[int]:
    """
    Run all Stage 1 hard filters and return the list of seller_ids to notify.

    Parameters
    ----------
    buyer              : User ORM object (the buyer who posted the request)
    bid_request        : BidRequest ORM object (newly created)
    db                 : SQLAlchemy database session
    exclude_seller_ids : set of seller IDs to exclude (used for resend rounds)
    allowed_districts  : set of normalised district names that are currently in
                         scope for the location filter.  When None (default) the
                         function falls back to a single strict match against
                         bid_request.location, preserving backward-compatibility.
                         Pass a growing set from run_pipeline() to enable the
                         proximity-fallback expansion.

    Returns
    -------
    list[int]   : seller_ids that passed all three hard filters
    """
    from ..models.models import Profile

    # Build request keyword set once (reused per seller)
    category = None
    if bid_request.category_id:
        from ..models.models import Category
        category = db.query(Category).filter(Category.id == bid_request.category_id).first()

    cat_name = category.name if category else ""
    request_text = f"{cat_name} {bid_request.description or ''}"
    request_keywords = _get_keywords(request_text)

    # Fetch all potential seller profiles (exclude buyer's own profile)
    candidate_profiles = (
        db.query(Profile)
        .filter(
            Profile.description.isnot(None),
            Profile.description != "",
            Profile.user_id != buyer.id,
        )
        .all()
    )

    matched_seller_ids: list[int] = []
    exclude_set = exclude_seller_ids or set()

    for profile in candidate_profiles:
        if profile.user_id in exclude_set:
            continue

        # ── Filter 2: Active status ───────────────────────────────────────────
        if not is_profile_active(profile):
            continue

        # ── Filter 1: Category / keyword relevance ───────────────────────────
        if not category_or_keyword_match(
            seller_id=profile.user_id,
            category_id=bid_request.category_id,
            request_keywords=request_keywords,
            profile=profile,
            db=db,
        ):
            continue

        # ── Filter 3: Location ────────────────────────────────────────────────
        # When allowed_districts is provided (proximity-fallback mode) check
        # membership in the expanding set; otherwise use the original strict
        # single-district comparison for backward-compatibility.
        from ..models.models import User
        seller_user = db.query(User).filter(User.id == profile.user_id).first()
        seller_location = seller_user.location if seller_user else None

        if allowed_districts is not None:
            if not location_match_any(seller_location, allowed_districts):
                continue
        else:
            if not location_match(bid_request.location, seller_location):
                continue

        # Passed all filters
        matched_seller_ids.append(profile.user_id)

    return matched_seller_ids
