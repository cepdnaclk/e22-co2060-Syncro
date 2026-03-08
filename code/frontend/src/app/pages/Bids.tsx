import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Gavel, Clock, CheckCircle, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Link } from 'react-router';

// ──────────────────────────────────────────────────────────────
// Mock Data
// ──────────────────────────────────────────────────────────────

const MOCK_REQUESTS = [
    {
        id: 'req_1',
        description: 'Need 100 custom branded T-shirts for a corporate tech event in Colombo.',
        category: 'Clothing & Fashion',
        status: 'open',
        bidsCount: 3,
        createdAt: '2024-03-05T10:00:00Z',
    },
    {
        id: 'req_2',
        description: 'Looking for a wedding cake vendor for 200 guests. Pastel theme preferred.',
        category: 'Bakery',
        status: 'accepted',
        bidsCount: 5,
        createdAt: '2024-03-01T15:30:00Z',
    },
];

const MOCK_AVAILABLE_JOBS = [
    {
        id: 'job_1',
        description: 'Require a professional event photographer for a 2-day workshop.',
        category: 'Photography',
        budget: '$200 - $500',
        timeLeft: '2 days',
        bidsCount: 8,
    },
    {
        id: 'job_2',
        description: 'Bulk order for 50 floral centerpieces for a gala dinner.',
        category: 'Floral Design',
        budget: 'Negotiable',
        timeLeft: '16 hours',
        bidsCount: 4,
    },
];

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

// ──────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────

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

            <Tabs defaultValue="requests" className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
                    <TabsTrigger value="requests" className="rounded-lg px-8 py-2.5">
                        {role === 'buyer' ? 'My Requests' : 'Available Jobs'}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg px-8 py-2.5">
                        {role === 'buyer' ? 'Request History' : 'My Bids'}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="requests" className="space-y-4">
                    {role === 'buyer' ? (
                        MOCK_REQUESTS.map((req, index) => (
                            <motion.div key={req.id} {...fadeInUp} transition={{ delay: index * 0.1 }}>
                                <Link to={`/bids/${req.id}`}>
                                    <Card hover className="overflow-hidden group border-border/50">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="info" className="bg-primary/5 text-primary border-primary/20 capitalize">
                                                            {req.category}
                                                        </Badge>
                                                        <Badge className={req.status === 'open' ? 'bg-green-500/10 text-green-600 border-none' : 'bg-blue-500/10 text-blue-600 border-none'}>
                                                            {req.status.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                                        {req.description}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" />
                                                            {new Date(req.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Gavel className="w-4 h-4" />
                                                            {req.bidsCount} bids received
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Button variant="ghost" size="sm" className="hidden md:flex">
                                                        View Details
                                                        <ChevronRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        MOCK_AVAILABLE_JOBS.map((job, index) => (
                            <motion.div key={job.id} {...fadeInUp} transition={{ delay: index * 0.1 }}>
                                <Card hover className="overflow-hidden border-border/50">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="info" className="bg-primary/5 text-primary border-primary/20">
                                                        {job.category}
                                                    </Badge>
                                                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-none">
                                                        NEW JOB
                                                    </Badge>
                                                </div>
                                                <h3 className="text-lg font-semibold">{job.description}</h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <DollarSign className="w-4 h-4" />
                                                        Budget: {job.budget}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        Ends in: {job.timeLeft}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button className="shrink-0" onClick={() => window.location.href = `/bids/${job.id}`}>
                                                Submit Proposal
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <Card className="border-dashed border-2 bg-muted/20">
                        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Clock className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No History Yet</h3>
                            <p className="text-muted-foreground max-w-xs">
                                Completed or non-active items will appear here once you start using the bidding portal.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function DollarSign({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <line x1="12" y1="2" x2="12" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}
