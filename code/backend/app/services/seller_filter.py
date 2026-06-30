"""
seller_filter.py — Stage 1: Hard Filters for Bid Notification Pipeline

When a buyer posts a bid request the system must decide which sellers to notify.
This module implements three binary pass/fail filters applied in sequence to
eliminate clearly unqualified sellers *before* any notification is issued.

Filter order (cheapest-to-most-expensive first):
  1. Active status  — profile.is_active must be True (or unset/NULL)
  2. Category/keyword match — seller must be relevant to the request category
  3. Location match — seller district must match buyer's district (strict)

Only sellers who pass ALL three filters are returned.
"""

import re
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
    return bool(request_keywords & profile_keywords)


def location_match(request_location: str | None, seller_location: str | None) -> bool:
    """
    Hard Filter 3 — Sri Lanka district matching (strict mode).

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


# ── Master Pipeline Function ──────────────────────────────────────────────────

def apply_hard_filters(buyer, bid_request, db: Session) -> list[int]:
    """
    Run all Stage 1 hard filters and return the list of seller_ids to notify.

    Parameters
    ----------
    buyer       : User ORM object (the buyer who posted the request)
    bid_request : BidRequest ORM object (newly created)
    db          : SQLAlchemy database session

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

    for profile in candidate_profiles:
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

        # ── Filter 3: Location (strict district match) ───────────────────────
        # Compare the AI-collected request location (bid_request.location)
        # against the seller's static registered location (User.location).
        from ..models.models import User
        seller_user = db.query(User).filter(User.id == profile.user_id).first()
        seller_location = seller_user.location if seller_user else None

        if not location_match(bid_request.location, seller_location):
            continue

        # Passed all filters
        matched_seller_ids.append(profile.user_id)

    return matched_seller_ids
