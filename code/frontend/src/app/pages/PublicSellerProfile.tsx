import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
    Star, MapPin, Globe, Phone, ArrowLeft,
    Package, Loader2, AlertCircle, Clock, ShoppingBag, Pencil, Send, CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { sellerProfileApi, reviewsApi, SellerPublicProfile, Review } from '../services/api';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Renders up to 5 stars, supporting half-star visual (using clip) */
function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
    const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => {
                const filled = rating >= i;
                const partial = !filled && rating > i - 1;
                const pct = partial ? Math.round((rating - (i - 1)) * 100) : 0;
                return (
                    <span key={i} className="relative inline-block">
                        {/* Empty star */}
                        <Star className={`${sizes[size]} text-muted-foreground`} />
                        {/* Filled overlay (full or partial) */}
                        {(filled || partial) && (
                            <span
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: filled ? '100%' : `${pct}%` }}
                            >
                                <Star className={`${sizes[size]} fill-yellow-400 text-yellow-400`} />
                            </span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}

/** Rating breakdown bar (5★ → 1★) */
function RatingBreakdown({ reviews }: { reviews: Review[] }) {
    const total = reviews.length;
    const counts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => Math.round(r.rating) === star).length,
    }));
    return (
        <div className="space-y-1.5 w-full">
            {counts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground w-4 text-right">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                            transition={{ duration: 0.6, delay: (5 - star) * 0.07 }}
                            className="h-full bg-yellow-400 rounded-full"
                        />
                    </div>
                    <span className="text-muted-foreground w-4 text-left">{count}</span>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline Review Form
// ─────────────────────────────────────────────────────────────────────────────
interface ReviewFormProps {
    sellerId: number;
    onReviewSubmitted: (review: Review) => void;
}

function ReviewForm({ sellerId, onReviewSubmitted }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0 || submitting) return;
        setSubmitting(true);
        try {
            const newReview = await reviewsApi.createForSeller(sellerId, {
                rating,
                comment: comment.trim() || undefined,
            });
            toast.success('Review submitted! Thank you.');
            onReviewSubmitted(newReview);
            // Reset form so buyer can add another review
            setRating(0);
            setComment('');
            setHoverRating(0);
        } catch (e: any) {
            toast.error(e.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Star picker */}
            <div>
                <p className="text-sm font-medium mb-2">Your rating <span className="text-destructive">*</span></p>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                className={`w-8 h-8 transition-colors ${
                                    star <= (hoverRating || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                }`}
                            />
                        </button>
                    ))}
                    {(hoverRating || rating) > 0 && (
                        <span className="ml-2 text-sm text-muted-foreground">
                            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][(hoverRating || rating)]}
                        </span>
                    )}
                </div>
            </div>

            {/* Comment */}
            <div>
                <p className="text-sm font-medium mb-2">Your review <span className="text-xs text-muted-foreground">(optional)</span></p>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Share your experience working with this seller…"
                    className="w-full px-4 py-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1">{comment.length}/500</p>
            </div>

            <Button
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className="w-full gap-2"
            >
                {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                ) : (
                    <><Send className="w-4 h-4" /> Submit Review</>
                )}
            </Button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export function PublicSellerProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { authUser, role } = useApp();

    const isOwnProfile = authUser?.userId !== undefined && Number(id) === authUser.userId;
    const isBuyer = role === 'buyer';

    const [data, setData] = useState<SellerPublicProfile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showReviewForm, setShowReviewForm] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        sellerProfileApi.getPublicProfile(Number(id))
            .then(profile => {
                setData(profile);
                setReviews(profile.reviews);
                setAvgRating(profile.avgRating);
            })
            .catch((e: any) => setError(e.message || 'Could not load profile'))
            .finally(() => setLoading(false));
    }, [id]);

    // Recalculate avg when reviews list changes
    const updateStats = (updatedReviews: Review[]) => {
        setReviews(updatedReviews);
        const avg = updatedReviews.length
            ? updatedReviews.reduce((s, r) => s + r.rating, 0) / updatedReviews.length
            : 0;
        setAvgRating(avg);
    };

    const handleReviewSubmitted = (newReview: Review) => {
        updateStats([newReview, ...reviews]);
        setShowReviewForm(false);
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading seller profile…</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                    <h1 className="text-2xl font-bold">Seller Not Found</h1>
                    <p className="text-muted-foreground">{error || "This seller profile doesn't exist."}</p>
                    <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
                </div>
            </div>
        );
    }

    const { profile, listings } = data;
    const reviewCount = reviews.length;
    const initials = (profile.name || 'S').substring(0, 2).toUpperCase();

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                {isOwnProfile && (
                    <Link to="/settings?tab=business">
                        <Button variant="outline" size="sm" className="gap-2 border-primary/40 text-primary hover:bg-primary/5">
                            <Pencil className="w-3.5 h-3.5" />
                            Edit Business Profile
                        </Button>
                    </Link>
                )}
            </div>

            {/* ── Own profile banner ── */}
            {isOwnProfile && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl text-sm"
                >
                    <span className="text-primary font-medium">👁 This is how buyers see your public profile.</span>
                    <Link to="/settings?tab=business" className="ml-auto text-primary underline underline-offset-2 hover:opacity-80 shrink-0 font-medium">
                        Edit Profile →
                    </Link>
                </motion.div>
            )}

            {/* ── Hero card ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="overflow-hidden shadow-xl border-border/50">
                    {/* Cover */}
                    <div className="relative h-40 bg-gradient-to-br from-primary via-primary/80 to-accent">
                        {profile.cover_image && (
                            <img src={profile.cover_image} alt="Cover" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    <CardContent className="p-8 -mt-16 relative">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                                <div className="w-28 h-28 rounded-2xl border-4 border-card shadow-2xl overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                    {profile.logo ? (
                                        <img src={profile.logo} alt={profile.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white font-bold text-4xl">{initials}</span>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-grow pt-10 md:pt-0">
                                <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>

                                {/* Rating summary */}
                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        {reviewCount > 0 && (
                                            <span className="text-2xl font-bold text-yellow-500">{avgRating.toFixed(1)}</span>
                                        )}
                                        <StarRating rating={avgRating} size="md" />
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {reviewCount > 0
                                            ? `(${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})`
                                            : 'No ratings yet'}
                                    </span>
                                </div>

                                {profile.description && (
                                    <p className="text-muted-foreground leading-relaxed mb-4 max-w-2xl">{profile.description}</p>
                                )}

                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                    {profile.address && (
                                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {profile.address}</span>
                                    )}
                                    {profile.website && (
                                        <a href={profile.website} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                            <Globe className="w-3.5 h-3.5" /> {profile.website}
                                        </a>
                                    )}
                                    {profile.phone && (
                                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {profile.phone}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── Listings ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Services Offered
                    <Badge variant="secondary" className="ml-2">{listings.length}</Badge>
                </h2>

                {listings.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <Package className="w-8 h-8 mx-auto mb-3 opacity-40" />
                            <p>No services listed yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {listings.map((listing, i) => (
                            <motion.div
                                key={listing.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                            >
                                <Link to={`/service/${listing.id}`}>
                                    <Card hover className="overflow-hidden group cursor-pointer h-full">
                                        <div className="aspect-video overflow-hidden bg-muted">
                                            {listing.image_url ? (
                                                <img
                                                    src={listing.image_url}
                                                    alt={listing.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-10 h-10 text-muted-foreground opacity-30" />
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4 space-y-2">
                                            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                                {listing.title}
                                            </h3>
                                            {listing.delivery_time && (
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {listing.delivery_time} delivery
                                                </p>
                                            )}
                                            <p className="text-xl font-bold text-primary">
                                                Rs. {listing.price.toLocaleString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* ── Reviews Section ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        Customer Reviews
                        <Badge variant="secondary" className="ml-2">{reviewCount}</Badge>
                    </h2>

                    {/* Write Review button — only for buyers who aren't the seller */}
                    {isBuyer && !isOwnProfile && (
                        <Button
                            variant={showReviewForm ? 'outline' : 'default'}
                            onClick={() => setShowReviewForm(v => !v)}
                            className="gap-2"
                        >
                            <Star className="w-4 h-4" />
                            {showReviewForm ? 'Cancel' : 'Write a Review'}
                        </Button>
                    )}
                </div>



                {/* Inline review form */}
                <AnimatePresence>
                    {showReviewForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-6"
                        >
                            <Card className="border-primary/30 bg-primary/5">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-primary" />
                                        Share your experience
                                    </h3>
                                    <ReviewForm sellerId={Number(id)} onReviewSubmitted={handleReviewSubmitted} />
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reviews list */}
                {reviews.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <Star className="w-8 h-8 mx-auto mb-3 opacity-40" />
                            <p className="font-medium">No reviews yet.</p>
                            {isBuyer && !isOwnProfile && (
                                <p className="text-sm mt-1">Be the first to review this seller!</p>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review, i) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card>
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-sm font-semibold">
                                                    {(review.reviewer_name || `U${review.reviewer_id}`).charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                                                    <span className="font-semibold text-sm">
                                                        {review.reviewer_name || `User ${review.reviewer_id}`}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground shrink-0">
                                                        {new Date(review.timestamp).toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                {/* Stars + numeric */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <StarRating rating={review.rating} size="sm" />
                                                    <span className="text-xs font-semibold text-yellow-600">
                                                        {review.rating.toFixed(1)}
                                                    </span>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {review.comment}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
