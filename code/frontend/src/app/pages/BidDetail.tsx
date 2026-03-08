import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft,
    Gavel,
    Calendar,
    DollarSign,
    Package,
    MessageSquare,
    CheckCircle,
    XCircle,
    Clock,
    Send,
    User,
    ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';

// ────────────────────────── Mock Data ──────────────────────────

const mockRequest = {
    id: 1,
    description: "I need 100 custom branded T-shirts for a corporate event. High quality cotton, screen printed logo with our company colors (Navy and Gold). Looking for a quick turnaround.",
    category_name: "Tailors",
    status: 'open',
    created_at: '2 hours ago',
    buyer_name: 'John Doe',
    budget_range: '$500 - $800'
};

const mockBids = [
    {
        id: 101,
        seller_name: 'Elite Garments',
        seller_rating: 4.8,
        seller_reviews: 124,
        price: 650,
        quantity: 100,
        delivery_time: '5 days',
        message: "We can handle this! We use premium 100% organic cotton and high-durability screen printing. I checked your logo and we have the exact gold ink in stock.",
        status: 'pending',
        created_at: '45 min ago'
    },
    {
        id: 102,
        seller_name: 'FastStitch Studio',
        seller_rating: 4.5,
        seller_reviews: 42,
        price: 720,
        quantity: 100,
        delivery_time: '3 days',
        message: "Need them fast? We specialize in quick turnarounds for corporate events. We can ship them within 72 hours of design approval.",
        status: 'pending',
        created_at: '1 hour ago'
    }
];

// ────────────────────────── Helpers ──────────────────────────

function statusVariant(status: string): 'success' | 'info' | 'warning' | 'error' {
    if (status === 'accepted') return 'success';
    if (status === 'pending') return 'info';
    if (status === 'rejected') return 'error';
    return 'warning';
}

// ────────────────────────── Component ──────────────────────────

export function BidDetail() {
    const { id } = useParams();
    const { role } = useApp();
    const navigate = useNavigate();
    const [bids, setBids] = useState(mockBids);
    const [showBidForm, setShowBidForm] = useState(false);
    const [bidAmount, setBidAmount] = useState('');
    const [bidMessage, setBidMessage] = useState('');

    const handleStatusUpdate = (bidId: number, newStatus: string) => {
        setBids(prev => prev.map(b =>
            b.id === bidId ? { ...b, status: newStatus as any } : b
        ));
    };

    const handleSubmitBid = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call the API
        alert("Bid submitted successfully!");
        setShowBidForm(false);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link to="/bids">
                    <Button variant="ghost" size="sm" className="-ml-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Bids
                    </Button>
                </Link>
                <Badge variant="info" className="text-muted-foreground">
                    Request ID: #{id}
                </Badge>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Request Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Badge variant="secondary">{mockRequest.category_name}</Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    Posted {mockRequest.created_at}
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-4">Request Description</h2>
                            <p className="text-lg leading-relaxed text-foreground/90 mb-6">
                                {mockRequest.description}
                            </p>
                            <div className="flex flex-wrap gap-6 pt-6 border-t border-primary/10">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Expected Budget</p>
                                    <p className="font-semibold text-primary">{mockRequest.budget_range}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Client</p>
                                    <p className="font-semibold">{mockRequest.buyer_name}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Gavel className="w-5 h-5 text-primary" />
                            {role === 'buyer' ? 'Bids from Sellers' : 'Existing Bids'}
                        </h3>

                        {bids.map((bid, index) => (
                            <motion.div
                                key={bid.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={bid.status === 'accepted' ? 'border-green-500 shadow-lg shadow-green-500/10' : ''}>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-bold text-primary">
                                                            {bid.seller_name[0]}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold flex items-center gap-2">
                                                                {bid.seller_name}
                                                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                                                            </h4>
                                                            <p className="text-xs text-muted-foreground">
                                                                ⭐ {bid.seller_rating} ({bid.seller_reviews} reviews)
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-primary">${bid.price}</p>
                                                        <p className="text-xs text-muted-foreground">Total for {bid.quantity} units</p>
                                                    </div>
                                                </div>

                                                <div className="bg-muted/50 p-4 rounded-xl text-sm leading-relaxed italic text-muted-foreground">
                                                    "{bid.message}"
                                                </div>

                                                <div className="flex flex-wrap gap-4 text-sm font-medium">
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Delivery: {bid.delivery_time}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        Escrow Protection
                                                    </div>
                                                </div>
                                            </div>

                                            {role === 'buyer' && bid.status === 'pending' && (
                                                <div className="flex flex-col justify-center gap-2 min-w-[120px]">
                                                    <Button
                                                        className="w-full bg-green-600 hover:bg-green-700 shadow-green-600/20"
                                                        onClick={() => handleStatusUpdate(bid.id, 'accepted')}
                                                    >
                                                        Accept Bid
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleStatusUpdate(bid.id, 'rejected')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}

                                            {bid.status !== 'pending' && (
                                                <div className="flex flex-col justify-center items-center gap-1 min-w-[120px]">
                                                    <Badge variant={statusVariant(bid.status) as any} className="w-full py-2 justify-center text-sm capitalize">
                                                        {bid.status === 'accepted' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                                                        Bid {bid.status}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Actions / Stats */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold">Request Summary</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm py-2 border-b border-border">
                                <span className="text-muted-foreground">Total Bids</span>
                                <span className="font-bold">{bids.length}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-border">
                                <span className="text-muted-foreground">Average Price</span>
                                <span className="font-bold">$685</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-border">
                                <span className="text-muted-foreground">Time Remaining</span>
                                <span className="font-bold text-orange-500">23h 45m</span>
                            </div>

                            {role === 'seller' && !showBidForm && (
                                <Button
                                    className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20"
                                    onClick={() => setShowBidForm(true)}
                                >
                                    <Gavel className="w-5 h-5 mr-2" />
                                    Place a Bid
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bid Submission Form for Sellers */}
                    <AnimatePresence>
                        {showBidForm && role === 'seller' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="border-primary shadow-xl ring-2 ring-primary/20">
                                    <CardHeader>
                                        <h3 className="text-lg font-bold">Submit Your Offer</h3>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0">
                                        <form onSubmit={handleSubmitBid} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold">Your Price ($)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="number"
                                                        required
                                                        placeholder="700"
                                                        value={bidAmount}
                                                        onChange={(e) => setBidAmount(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold">Delivery Estimate</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. 4 days"
                                                        className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold">Cover Letter / Proposal</label>
                                                <textarea
                                                    rows={4}
                                                    required
                                                    placeholder="Tell the client why they should choose you..."
                                                    value={bidMessage}
                                                    onChange={(e) => setBidMessage(e.target.value)}
                                                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                                />
                                            </div>

                                            <div className="pt-2 flex gap-2">
                                                <Button type="submit" className="flex-1 font-bold">
                                                    Submit Bid
                                                    <Send className="w-4 h-4 ml-2" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setShowBidForm(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
