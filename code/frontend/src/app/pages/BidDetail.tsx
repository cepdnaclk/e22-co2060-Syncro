import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
    ChevronLeft, Clock, Gavel, DollarSign, Package,
    CheckCircle2, AlertCircle, MessageSquare, Send,
    User, Star, ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/textarea';
import { Link, useParams } from 'react-router';

// ──────────────────────────────────────────────────────────────
// Mock Data
// ──────────────────────────────────────────────────────────────

const MOCK_REQUEST: { id: string; description: string; category: string; status: string; createdAt: string; userName: string } | null = null;
const MOCK_BIDS: { id: string; sellerName: string; rating: number; price: number; quantity: number; deliveryTime: string; message: string; status: string }[] = [];

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
    const { role } = useApp();
    const [acceptedBidId, setAcceptedBidId] = useState<string | null>(null);
    const [bidAmount, setBidAmount] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [proposal, setProposal] = useState('');

    const handleAccept = (bidId: string) => {
        setAcceptedBidId(bidId);
        // In a real app, call API
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
                    {!MOCK_REQUEST ? (
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
                                            {MOCK_REQUEST.category}
                                        </Badge>
                                        <Badge className="bg-green-500 text-white border-none px-4">
                                            {MOCK_REQUEST.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <h1 className="text-2xl font-bold leading-tight">
                                        {MOCK_REQUEST.description.substring(0, 100)}...
                                    </h1>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-primary" />
                                            Full Description
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {MOCK_REQUEST.description}
                                        </p>
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-border/50">
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground uppercase font-semibold">User</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {MOCK_REQUEST.userName}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground uppercase font-semibold">Posted On</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {new Date(MOCK_REQUEST.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground uppercase font-semibold">Total Proposals</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Gavel className="w-4 h-4" />
                                                {MOCK_BIDS.length} sellers
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
                            {MOCK_BIDS.map((bid, index) => (
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
                                                        <div>
                                                            <h3 className="font-bold text-lg">{bid.sellerName}</h3>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                                <span className="text-sm font-medium">{bid.rating}</span>
                                                                <span className="text-xs text-muted-foreground ml-1">Rating</span>
                                                            </div>
                                                        </div>
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
                                                            {bid.deliveryTime} delivery
                                                        </div>
                                                        <div className="flex items-center gap-2 font-medium">
                                                            <ShieldCheck className="w-4 h-4 text-green-600" />
                                                            Verified Seller
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 min-w-[140px]">
                                                    {acceptedBidId === bid.id ? (
                                                        <Button disabled className="w-full bg-green-600 text-white border-none h-12">
                                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                                            Accepted
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                className="w-full h-12"
                                                                onClick={() => handleAccept(bid.id)}
                                                                disabled={!!acceptedBidId}
                                                            >
                                                                Accept Bid
                                                            </Button>
                                                            <Button variant="outline" className="w-full" disabled={!!acceptedBidId}>
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
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
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold">Total Price (Rs.)</label>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 1500"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                            />
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
                                    <Button className="w-full h-12 text-lg shadow-lg shadow-primary/20 group">
                                        Send Proposal
                                        <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
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
