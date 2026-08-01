import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Gavel, Clock, CheckCircle, ChevronRight, MessageSquare, AlertCircle, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bidsApi, BidRequest } from '../services/api';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

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

export function Bids() {
    const { t } = useTranslation();
    const { role, setIsChatOpen, socketOn } = useApp();
    const [activeTab, setActiveTab] = useState<'requests' | 'my-bids'>(role === 'buyer' ? 'requests' : 'requests');
    const [myRequests, setMyRequests] = useState<BidRequest[]>([]);
    const [availableJobs, setAvailableJobs] = useState<BidRequest[]>([]);
    const [myBids, setMyBids] = useState<any[]>([]);

    useEffect(() => {
        if (role === 'buyer') {
            bidsApi.getMyRequests().then(data => setMyRequests(data)).catch(console.error);
        } else {
            bidsApi.getMatchingRequests().then(data => setAvailableJobs(data)).catch(console.error);
            bidsApi.getMyBids().then(data => setMyBids(data)).catch(console.error);
        }
    }, [role]);

    // ── Real-time updates via shared socket ───────────────────────────────────
    useEffect(() => {
        const unsubscribe = socketOn('new_notification', (data: any) => {
            if (data.type === 'new_request') {
                // A buyer just posted a new request that matches this seller’s profile.
                // Re-fetch the matching jobs list so it appears instantly.
                bidsApi.getMatchingRequests().then(setAvailableJobs).catch(console.error);
            }
            if (data.type === 'new_bid') {
                // Seller submitted a bid — refresh the buyer’s own request list
                // so bid counts stay accurate on the Bids page.
                if (role === 'buyer') {
                    bidsApi.getMyRequests().then(setMyRequests).catch(console.error);
                }
            }
        });
        return unsubscribe;
    }, [role, socketOn]);

    const openRequests = myRequests.filter(req => req.status.toLowerCase() === 'open');
    const historyRequests = myRequests.filter(req => req.status.toLowerCase() !== 'open');

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{t('bids.title')}</h1>
                    <p className="text-muted-foreground">
                        {role === 'buyer'
                            ? t('bids.buyer_subtitle')
                            : t('bids.seller_subtitle')}
                    </p>
                </div>
                {role === 'buyer' && (
                    <Button
                        size="lg"
                        className="shadow-lg shadow-primary/20"
                        onClick={() => setIsChatOpen(true)}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        {t('bids.create_request')}
                    </Button>
                )}
            </div>

            <Tabs defaultValue="requests" className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
                    <TabsTrigger value="requests" className="rounded-lg px-8 py-2.5">
                        {role === 'buyer' ? t('bids.my_requests') : t('bids.available_jobs')}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg px-8 py-2.5">
                        {role === 'buyer' ? t('bids.request_history') : t('bids.my_bids')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="requests" className="space-y-4">
                    {role === 'buyer' ? (
                        openRequests.length === 0 ? (
                            <Card className="border-dashed border-2 bg-muted/20">
                                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Gavel className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{t('bids.no_requests_yet')}</h3>
                                    <p className="text-muted-foreground max-w-xs">
                                        {t('bids.no_requests_desc')}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : openRequests.map((req, index) => (
                            <motion.div key={req.id} {...fadeInUp} transition={{ delay: index * 0.1 }}>
                                <Link to={`/bids/${req.id}`}>
                                    <Card hover className="overflow-hidden group border-border/50">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="info" className="bg-primary/5 text-primary border-primary/20 capitalize">
                                                            {t('bids.cat')}: {req.category_id}
                                                        </Badge>
                                                        <Badge className={req.status.toLowerCase() === 'open' ? 'bg-green-500/10 text-green-600 border-none' : 'bg-blue-500/10 text-blue-600 border-none'}>
                                                            {req.status.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                                        {req.description}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" />
                                                            {new Date(req.created_at).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Gavel className="w-4 h-4" />
                                                            {t('bids.view_bids')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Button variant="ghost" size="sm" className="hidden md:flex">
                                                        {t('bids.view_details')}
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
                        availableJobs.length === 0 ? (
                            <Card className="border-dashed border-2 bg-muted/20">
                                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Package className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{t('bids.no_available_jobs')}</h3>
                                    <p className="text-muted-foreground max-w-xs">
                                        {t('bids.no_available_jobs_desc')}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : availableJobs.map((job, index) => (
                            <motion.div key={job.id} {...fadeInUp} transition={{ delay: index * 0.1 }}>
                                <Card hover className="overflow-hidden border-border/50">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="info" className="bg-primary/5 text-primary border-primary/20">
                                                        {t('bids.cat')}: {job.category_id}
                                                    </Badge>
                                                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-none">
                                                        {t('bids.new_job')}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-lg font-semibold">{job.description}</h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <DollarSign className="w-4 h-4" />
                                                        {t('bids.open')}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(job.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button className="shrink-0" onClick={() => window.location.href = `/bids/${job.id}`}>
                                                {t('bids.submit_proposal')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    {role === 'buyer' ? (
                        historyRequests.length === 0 ? (
                            <Card className="border-dashed border-2 bg-muted/20">
                                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Clock className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{t('bids.no_history_yet')}</h3>
                                    <p className="text-muted-foreground max-w-xs">
                                        {t('bids.no_history_desc')}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : historyRequests.map((req, index) => (
                            <motion.div key={req.id} {...fadeInUp} transition={{ delay: index * 0.1 }}>
                                <Link to={`/bids/${req.id}`}>
                                    <Card hover className="overflow-hidden group border-border/50 opacity-80">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="info" className="bg-primary/5 text-primary border-primary/20 capitalize">
                                                            {t('bids.cat')}: {req.category_id}
                                                        </Badge>
                                                        <Badge className={req.status.toLowerCase() === 'open' ? 'bg-green-500/10 text-green-600 border-none' : 'bg-blue-500/10 text-blue-600 border-none'}>
                                                            {req.status.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-lg font-semibold line-clamp-2">
                                                        {req.description}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" />
                                                            {new Date(req.created_at).toLocaleDateString()}
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
                        myBids.length === 0 ? (
                            <Card className="border-dashed border-2 bg-muted/20">
                                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Gavel className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{t('bids.no_bids_placed')}</h3>
                                    <p className="text-muted-foreground max-w-xs">
                                        {t('bids.no_bids_desc')}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : myBids.map((bid, index) => (
                            <motion.div key={bid.id} {...fadeInUp} transition={{ delay: index * 0.1 }}>
                                <Link to={`/bids/${bid.bid_request_id}`}>
                                    <Card hover className="overflow-hidden group border-border/50">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={
                                                            bid.status.toLowerCase() === 'accepted' ? 'bg-green-500/10 text-green-600 border-none' :
                                                            bid.status.toLowerCase() === 'rejected' ? 'bg-red-500/10 text-red-600 border-none' :
                                                            'bg-blue-500/10 text-blue-600 border-none'
                                                        }>
                                                            {bid.status.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-lg font-semibold line-clamp-2">
                                                        {t('bids.proposal')}: Rs. {bid.price.toLocaleString()} {t('bids.for')} {bid.quantity} {t('bids.units')}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-1 italic">
                                                        "{bid.message}"
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" />
                                                            {t('bids.submitted')}: {new Date(bid.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Button variant="ghost" size="sm" className="hidden md:flex">
                                                        {t('bids.view_request')}
                                                        <ChevronRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))
                    )}
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
