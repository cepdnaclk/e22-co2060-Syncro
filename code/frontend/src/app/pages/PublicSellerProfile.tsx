import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import {
    Star, MapPin, Globe, Phone, ArrowLeft,
    Package, Loader2, AlertCircle, Clock, ShoppingBag, Pencil
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { sellerProfileApi, SellerPublicProfile } from '../services/api';
import { useApp } from '../context/AppContext';

// ─────────────────────────────────────────────────────────────────────────────
// Public Seller Profile — fetches real data by seller user_id from the backend
// Accessible at /seller/:id where :id is the seller's user_id
// ─────────────────────────────────────────────────────────────────────────────

export function PublicSellerProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { authUser } = useApp();

    // True when the logged-in seller is viewing their own profile
    const isOwnProfile = authUser?.userId !== undefined && Number(id) === authUser.userId;

    const [data, setData] = useState<SellerPublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        sellerProfileApi.getPublicProfile(Number(id))
            .then(setData)
            .catch((e: any) => setError(e.message || 'Could not load profile'))
            .finally(() => setLoading(false));
    }, [id]);

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

    // ── Error / Not found ────────────────────────────────────────────────────
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

    const { profile, listings, reviews, avgRating, reviewCount } = data;
    const initials = (profile.name || 'S').substring(0, 2).toUpperCase();

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">

            {/* ── Top bar: Back + Edit (own profile only) ── */}
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

            {/* ── "Your public profile" info banner (own profile only) ── */}
            {isOwnProfile && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl text-sm"
                >
                    <span className="text-primary font-medium">
                        👁 This is how buyers see your public profile.
                    </span>
                    <Link
                        to="/settings?tab=business"
                        className="ml-auto text-primary underline underline-offset-2 hover:opacity-80 shrink-0 font-medium"
                    >
                        Edit Profile →
                    </Link>
                </motion.div>
            )}

            {/* ── Hero / Header card ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="overflow-hidden shadow-xl border-border/50">
                    {/* Cover */}
                    <div className="relative h-40 bg-gradient-to-br from-primary via-primary/80 to-accent">
                        {profile.cover_image && (
                            <img
                                src={profile.cover_image}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    <CardContent className="p-8 -mt-16 relative">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Logo / Avatar */}
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
                                <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>

                                {/* Rating row */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${
                                                    i <= Math.round(avgRating)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-muted-foreground'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="font-semibold text-sm">
                                        {reviewCount > 0 ? avgRating.toFixed(1) : 'No ratings'}
                                    </span>
                                    {reviewCount > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {profile.description && (
                                    <p className="text-muted-foreground leading-relaxed mb-4 max-w-2xl">
                                        {profile.description}
                                    </p>
                                )}

                                {/* Contact chips */}
                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                    {profile.address && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" /> {profile.address}
                                        </span>
                                    )}
                                    {profile.website && (
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 hover:text-primary transition-colors"
                                        >
                                            <Globe className="w-3.5 h-3.5" /> {profile.website}
                                        </a>
                                    )}
                                    {profile.phone && (
                                        <span className="flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5" /> {profile.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── Listings ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
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

            {/* ── Reviews ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    Customer Reviews
                    <Badge variant="secondary" className="ml-2">{reviewCount}</Badge>
                </h2>

                {reviews.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <Star className="w-8 h-8 mx-auto mb-3 opacity-40" />
                            <p>No reviews yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review: any) => (
                            <Card key={review.id}>
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-sm font-semibold">
                                                {String(review.reviewer_id ?? '?').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-sm">
                                                    {review.reviewer_name || `User ${review.reviewer_id}`}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-0.5 mb-2">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${
                                                            i <= review.rating
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    />
                                                ))}
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
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
