import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    ChevronLeft, Clock, Gavel, DollarSign, Package,
    CheckCircle2, AlertCircle, MessageSquare, Send,
    User, Star, ShieldCheck, Percent
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/textarea';
import { Link, useParams, useNavigate } from 'react-router';
import { bidsApi, BidRequest, Bid, reviewsApi } from '../services/api';
import { toast } from 'sonner';

// ──────────────────────────────────────────────────────────────
// Mock Data
// ──────────────────────────────────────────────────────────────



const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

// ──────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────

export function BidDetail() {
    const { id } = useParams();
    const { role, authUser, socketOn } = useApp();
    const navigate = useNavigate();
    const [acceptedBidId, setAcceptedBidId] = useState<number | null>(null);
    const [bidAmount, setBidAmount] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [proposal, setProposal] = useState('');
    const [request, setRequest] = useState<BidRequest | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [myBids, setMyBids] = useState<Bid[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [rejecting, setRejecting] = useState<number | null>(null);
    // Map of seller_id -> { avg, count } fetched from reviews API
    const [sellerRatings, setSellerRatings] = useState<Record<number, { avg: number; count: number }>>({});

    useEffect(() => {
        if (!id) return;
        bidsApi.getRequestById(Number(id)).then(setRequest).catch(console.error);
        if (role === 'buyer') {
            bidsApi.getBidsForRequest(Number(id)).then((fetchedBids) => {
                setBids(fetchedBids);
                // Fetch ratings for every unique seller in this bid list
                const uniqueSellers = [...new Set(fetchedBids.map(b => b.seller_id))];
                Promise.all(
                    uniqueSellers.map(sid =>
                        reviewsApi.getAvgRating(sid).then(r => ({ sid, r }))
                    )
                ).then(results => {
                    const map: Record<number, { avg: number; count: number }> = {};
                    results.forEach(({ sid, r }) => { map[sid] = r; });
                    setSellerRatings(map);
                }).catch(console.error);
            }).catch(console.error);
        } else if (role === 'seller') {
            bidsApi.getMyBids().then(setMyBids).catch(console.error);
        }
    }, [id, role]);

    // ── Real-time: re-fetch bids when a new proposal arrives for this request ──
    // The backend emits new_notification{type:'new_bid', reference_id: bid_request_id}
    // to the buyer's room every time a seller submits a bid.
    useEffect(() => {
        if (!id || role !== 'buyer') return;
        const unsubscribe = socketOn('new_notification', (data: any) => {
            if (data.type === 'new_bid' && Number(data.reference_id) === Number(id)) {
                bidsApi.getBidsForRequest(Number(id)).then((fetchedBids) => {
                    setBids(fetchedBids);
                    const uniqueSellers = [...new Set(fetchedBids.map(b => b.seller_id))];
                    Promise.all(
                        uniqueSellers.map(sid =>
                            reviewsApi.getAvgRating(sid).then(r => ({ sid, r }))
                        )
                    ).then(results => {
                        const map: Record<number, { avg: number; count: number }> = {};
                        results.forEach(({ sid, r }) => { map[sid] = r; });
                        setSellerRatings(map);
                    }).catch(console.error);
                }).catch(console.error);
            }
        });
        return unsubscribe;
    }, [id, role, socketOn]);

    const hasPlacedActiveBid = myBids.some(b => b.bid_request_id === Number(id) && b.status.toLowerCase() !== 'rejected');

    const handleAccept = async (bidId: number) => {
        try {
            await bidsApi.acceptBid(bidId);
            setAcceptedBidId(bidId); // Keeps track of the most recently accepted one for highlighting
            // Update local state for just the accepted bid
            setBids(prev => prev.map(b => 
                b.id === bidId ? { ...b, status: 'accepted' } : b
            ));
            toast.success("Bid accepted successfully!");
        } catch (e: any) {
            toast.error(e.message || "Failed to accept bid");
        }
    };

    const handleReject = async (bidId: number) => {
        if (rejecting) return;
        try {
            setRejecting(bidId);
            await bidsApi.rejectBid(bidId);
            setBids(prev => prev.map(b =>
                b.id === bidId ? { ...b, status: 'rejected' } : b
            ));
            toast.success('Proposal rejected.');
        } catch (e: any) {
            toast.error(e.message || 'Failed to reject bid');
        } finally {
            setRejecting(null);
        }
    };

    const handleSubmitBid = async () => {
        if (!id || !bidAmount || submitting) return;
        try {
            setSubmitting(true);
            await bidsApi.submitBid({
                bid_request_id: Number(id),
                price: Number(bidAmount),
                quantity: 1,
                delivery_time: deliveryTime,
                message: proposal
            });
            toast.success("Bid submitted successfully!");
            setBidAmount('');
            setDeliveryTime('');
            setProposal('');
            // Refresh seller's own bids so hasPlacedActiveBid updates immediately
            bidsApi.getMyBids().then(setMyBids).catch(console.error);
        } catch (e: any) {
            toast.error(e.message || "Failed to submit bid");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <Link
                to="/bids"
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Bids
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Request Details */}
                <div className="lg:col-span-2 space-y-8">
                    {!request ? (
                        <Card className="border-dashed border-2 bg-muted/20">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-30" />
                                <h3 className="text-xl font-semibold mb-2">Request Not Found</h3>
                                <p className="text-muted-foreground">The request you are looking for does not exist or has been removed.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <motion.div {...fadeInUp}>
                            <Card className="border-border/50 shadow-sm overflow-hidden">
                                <CardHeader className="bg-muted/30 p-8 border-b border-border/50">
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <Badge variant="info" className="bg-primary/5 text-primary border-primary/20">
                                            Cat: {request.category_id}
                                        </Badge>
                                        <Badge className="bg-green-500 text-white border-none px-4">
                                            {request.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <h1 className="text-2xl font-bold leading-tight">
                                        {request.description.substring(0, 100)}...
                                    </h1>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-primary" />
                                            Full Description
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {request.description}
                                        </p>
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-border/50">
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground uppercase font-semibold">User</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {request.user_name || (authUser && authUser.userId === request.user_id && authUser.first_name ? authUser.first_name : `User ${request.user_id}`)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground uppercase font-semibold">Posted On</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground uppercase font-semibold">Total Proposals</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Gavel className="w-4 h-4" />
                                                {bids.length} sellers
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Bids List (Buyer View) */}
                    {role === 'buyer' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Received Bids</h2>
                            {bids.length === 0 ? (
                                <p className="text-muted-foreground">No bids received yet.</p>
                            ) : bids.map((bid, index) => (
                                <motion.div
                                    key={bid.id}
                                    {...fadeInUp}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className={`overflow-hidden transition-all ${acceptedBidId === bid.id ? 'ring-2 ring-green-500 bg-green-50/50' : 'hover:shadow-md'}`}>
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Link
                                                            to={`/seller/${bid.seller_id}`}
                                                            className="flex items-center gap-3 group/seller hover:opacity-80 transition-opacity"
                                                            title="View seller profile"
                                                        >
                                                            {bid.seller_logo ? (
                                                                <img
                                                                    src={bid.seller_logo}
                                                                    alt={bid.seller_name || 'Seller'}
                                                                    className="w-10 h-10 rounded-lg object-cover border border-border shrink-0 group-hover/seller:ring-2 group-hover/seller:ring-primary transition-all"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 border border-border group-hover/seller:ring-2 group-hover/seller:ring-primary transition-all">
                                                                    <span className="text-sm font-bold text-primary">
                                                                        {(bid.seller_name || `S${bid.seller_id}`).substring(0, 2).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h3 className="font-bold text-lg group-hover/seller:text-primary transition-colors">
                                                                    {bid.seller_name || `Seller ${bid.seller_id}`}
                                                                </h3>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    {(() => {
                                                                        const sr = sellerRatings[bid.seller_id];
                                                                        const avg = sr?.avg ?? 0;
                                                                        const count = sr?.count ?? 0;
                                                                        return (
                                                                            <>
                                                                                {[1,2,3,4,5].map(i => (
                                                                                    <Star key={i} className={`w-3 h-3 ${i <= Math.round(avg) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                                                                                ))}
                                                                                <span className="text-sm font-medium ml-1">
                                                                                    {count > 0 ? avg.toFixed(1) : 'No ratings'}
                                                                                </span>
                                                                                {count > 0 && (
                                                                                    <span className="text-xs text-muted-foreground">({count})</span>
                                                                                )}
                                                                                <span className="text-xs text-primary ml-1 underline underline-offset-2">View Profile →</span>
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-primary">Rs. {bid.price.toLocaleString()}</p>
                                                            <p className="text-sm text-muted-foreground">for {bid.quantity} units</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-muted/50 rounded-xl p-4">
                                                        <p className="text-sm italic text-muted-foreground">"{bid.message}"</p>
                                                    </div>

                                                    <div className="flex items-center gap-6 text-sm">
                                                        <div className="flex items-center gap-2 font-medium">
                                                            <Clock className="w-4 h-4 text-primary" />
                                                            {bid.delivery_time} delivery
                                                        </div>
                                                        <div className="flex items-center gap-2 font-medium">
                                                            <ShieldCheck className="w-4 h-4 text-green-600" />
                                                            Verified Seller
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 min-w-[140px]">
                                                    {bid.status.toLowerCase() === 'accepted' ? (
                                                        <Button disabled className="w-full bg-green-600 text-white border-none h-12 opacity-100">
                                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                                            Accepted
                                                        </Button>
                                                    ) : bid.status.toLowerCase() === 'rejected' ? (
                                                        <Button disabled variant="outline" className="w-full bg-red-50 text-red-600 border-red-200">
                                                            Rejected
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                className="w-full h-12"
                                                                onClick={() => handleAccept(bid.id)}
                                                            >
                                                                Accept Bid
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full"
                                                                disabled={rejecting === bid.id}
                                                                onClick={() => handleReject(bid.id)}
                                                            >
                                                                {rejecting === bid.id ? 'Rejecting...' : 'Reject'}
                                                            </Button>
                                                        </>
                                                    )}
                                                    {/* Message Seller — always visible to buyer */}
                                                    <Button
                                                        id={`message-seller-${bid.id}`}
                                                        variant="outline"
                                                        className="w-full flex items-center gap-2 mt-1"
                                                        onClick={() =>
                                                            navigate(
                                                                `/messages?userId=${bid.seller_id}&name=${encodeURIComponent(bid.seller_name || `Seller ${bid.seller_id}`)}`
                                                            )
                                                        }
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        Message Seller
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar - Bid Form (Seller View) */}
                <div className="space-y-6">
                    {role === 'seller' ? (
                        hasPlacedActiveBid ? (() => {
                            const activeBid = myBids.find(b => b.bid_request_id === Number(id) && b.status.toLowerCase() !== 'rejected');
                            return (
                                <Card className="border-primary/20 shadow-lg shadow-primary/5 sticky top-24 overflow-hidden">
                                    <CardHeader className="bg-green-500/5 p-6 border-b border-green-500/10 text-center">
                                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-green-700">Proposal Submitted</h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Your offer is active and visible to the buyer.
                                        </p>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-5">
                                        {activeBid && (
                                            <>
                                                <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground">Total Bid Price</span>
                                                        <span className="font-semibold text-foreground">
                                                            Rs. {activeBid.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            Platform Fee (5%)
                                                        </span>
                                                        <span className="font-semibold text-destructive/80">
                                                            - Rs. {(activeBid.price * 0.05).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm pt-2.5 border-t border-border/40">
                                                        <span className="font-semibold text-green-600 flex items-center gap-1">
                                                            Profit
                                                        </span>
                                                        <span className="font-bold text-green-600 text-base">
                                                            Rs. {(activeBid.price * 0.95).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5 text-sm">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Time</span>
                                                    <p className="font-medium text-foreground">{activeBid.delivery_time || 'Not specified'}</p>
                                                </div>

                                                {activeBid.message && (
                                                    <div className="space-y-1.5 text-sm">
                                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Proposal Message</span>
                                                        <p className="text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/30 italic text-xs leading-relaxed">
                                                            "{activeBid.message}"
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <p className="text-xs text-muted-foreground text-center pt-2 leading-relaxed">
                                            Check the "My Bids" tab to track its status.
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })() : (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="sticky top-24"
                            >
                            <Card className="border-primary/20 shadow-lg shadow-primary/5">
                                <CardHeader className="bg-primary/5 p-6 border-b border-primary/10 text-center">
                                    <h3 className="text-xl font-bold text-primary">Submit Your Proposal</h3>
                                    <p className="text-xs text-muted-foreground mt-1 text-primary/60">
                                        Send your best offer to win this job
                                    </p>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2 relative">
                                            <label className="text-sm font-semibold">Total Price (Rs.)</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 1500"
                                                    value={bidAmount}
                                                    onChange={(e) => setBidAmount(e.target.value)}
                                                />
                                                {parseFloat(bidAmount) > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        className="absolute z-20 bottom-full right-0 mb-2 bg-gradient-to-r from-primary to-primary/80 text-white px-3 py-1.5 rounded-xl shadow-lg border border-primary/20 backdrop-blur-md flex items-center justify-center text-xs font-semibold"
                                                    >
                                                        <span>Profit: Rs. {(parseFloat(bidAmount) * 0.95).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        {/* Tooltip pointer */}
                                                        <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-primary"></div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold">Delivery Time</label>
                                            <Input
                                                placeholder="e.g. 3 days"
                                                value={deliveryTime}
                                                onChange={(e) => setDeliveryTime(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold">Your Proposal</label>
                                            <Textarea
                                                placeholder="Describe your service quality and why the user should choose you..."
                                                className="min-h-[120px]"
                                                value={proposal}
                                                onChange={(e) => setProposal(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={handleSubmitBid} disabled={submitting} className="w-full h-12 text-lg shadow-lg shadow-primary/20 group">
                                                        {submitting ? 'Sending...' : 'Send Proposal'}
                                        <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                        )
                    ) : (
                        <Card className="bg-muted/10 border-dashed sticky top-24">
                            <CardContent className="p-8 text-center space-y-4">
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                                    <Clock className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold">Wait for Proposals</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Once sellers find your request, they will submit their best bids here. You can then accept the one that fits your budget and quality.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
