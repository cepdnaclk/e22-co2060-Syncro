import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Gavel,
    Search,
    Plus,
    Filter,
    Clock,
    CheckCircle,
    XCircle,
    ChevronRight,
    MessageSquare,
    DollarSign,
    Package
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';

// ────────────────────────── Types ──────────────────────────

interface BidRequest {
    id: number;
    description: string;
    category_id: number;
    status: 'open' | 'closed' | 'accepted';
    created_at: string;
    category_name?: string;
    bid_count: number;
}

// ────────────────────────── Mock Data ──────────────────────────

const mockRequests: BidRequest[] = [
    {
        id: 1,
        description: "I need 100 custom branded T-shirts for a corporate event. High quality cotton, screen printed logo.",
        category_id: 1,
        category_name: "Tailors",
        status: 'open',
        created_at: '2 hours ago',
        bid_count: 3
    },
    {
        id: 2,
        description: "Looking for a wedding cake for 50 people. Design: Rustic style with fresh flowers.",
        category_id: 2,
        category_name: "Bakery",
        status: 'accepted',
        created_at: '1 day ago',
        bid_count: 5
    }
];

const mockSellerMatchingRequests: BidRequest[] = [
    {
        id: 3,
        description: "Need a math tutor for high school level. 2 hours per week.",
        category_id: 3,
        category_name: "Tutors",
        status: 'open',
        created_at: '1 hour ago',
        bid_count: 1
    }
];

// ────────────────────────── Helper ──────────────────────────

function statusVariant(status: string): 'success' | 'info' | 'warning' | 'error' | 'secondary' {
    if (status === 'accepted' || status === 'open') return 'success';
    if (status === 'pending') return 'info';
    if (status === 'closed' || status === 'rejected') return 'error';
    return 'warning';
}

// ────────────────────────── Main Component ────────────────────

export function Bids() {
    const { role, setIsChatOpen } = useApp();
    const [activeTab, setActiveTab] = useState<'requests' | 'my-bids'>(role === 'buyer' ? 'requests' : 'requests');

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Bidding Portal</h1>
                    <p className="text-muted-foreground">
                        {role === 'buyer'
                            ? 'Manage your service requests and evaluate seller bids.'
                            : 'Browse matching requests and manage your submitted bids.'}
                    </p>
                </div>
                {role === 'buyer' && (
                    <Button
                        size="lg"
                        className="shadow-lg shadow-primary/20"
                        onClick={() => setIsChatOpen(true)}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Request
                    </Button>
                )}
            </div>

            {/* Tabs for Sellers */}
            {role === 'seller' && (
                <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'requests' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Matching Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('my-bids')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'my-bids' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        My Submitted Bids
                    </button>
                </div>
            )}

            {/* Grid Layout */}
            <div className="grid lg:grid-cols-12 gap-6">
                {/* Main List */}
                <div className="lg:col-span-8 space-y-4">
                    <AnimatePresence mode="wait">
                        {activeTab === 'requests' ? (
                            <motion.div
                                key="requests"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                {(role === 'buyer' ? mockRequests : mockSellerMatchingRequests).map((req) => (
                                    <Card key={req.id} hover className="group">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="secondary" className="bg-primary/5 border-primary/20 text-primary">
                                                                {req.category_name}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {req.created_at}
                                                            </span>
                                                        </div>
                                                        <Badge variant={statusVariant(req.status)} className="capitalize">
                                                            {req.status}
                                                        </Badge>
                                                    </div>

                                                    <div>
                                                        <p className="text-lg font-medium leading-relaxed group-hover:text-primary transition-colors">
                                                            {req.description}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-6 pt-2">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Gavel className="w-4 h-4" />
                                                            <span className="font-semibold text-foreground">{req.bid_count}</span> Bids received
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <MessageSquare className="w-4 h-4" />
                                                            <span className="font-semibold text-foreground">2</span> Queries
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col justify-center gap-2 min-w-[140px]">
                                                    <Link to={`/bids/${req.id}`}>
                                                        <Button className="w-full" variant={role === 'seller' ? 'primary' : 'outline'}>
                                                            {role === 'seller' ? 'View & Bid' : 'Manage Bids'}
                                                            <ChevronRight className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="my-bids"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                        <Gavel className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No bids submitted yet</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        Browse the matching requests tab to find jobs that suit your skills and submit your first bid.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
                        <CardHeader>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-primary" />
                                How Bidding Works
                            </h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                <div>
                                    <h4 className="font-semibold text-sm">Post a Request</h4>
                                    <p className="text-xs text-muted-foreground">Describe what you need in detail so sellers can give accurate bids.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                <div>
                                    <h4 className="font-semibold text-sm">Receive Offers</h4>
                                    <p className="text-xs text-muted-foreground">Sellers will submit their price, quantity, and delivery estimates.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                <div>
                                    <h4 className="font-semibold text-sm">Select & Hire</h4>
                                    <p className="text-xs text-muted-foreground">Accept the best bid to create an official order and start working.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold">Bidding Stats</h3>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                <div className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm">Pending Bids</span>
                                    </div>
                                    <span className="font-bold">12</span>
                                </div>
                                <div className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm">Accepted Bids</span>
                                    </div>
                                    <span className="font-bold">34</span>
                                </div>
                                <div className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-red-100 text-red-600">
                                            <XCircle className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm">Rejected</span>
                                    </div>
                                    <span className="font-bold">5</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
