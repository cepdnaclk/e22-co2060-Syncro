import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Bot,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { Link, useLocation } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { SellerOnboarding } from '../components/SellerOnboarding';
import { buyerActivities, revenueData, orderData } from '../services/mockData';
import type { Activity } from '../services/mockData';
import { ordersApi, profilesApi, listingsApi, Order } from '../services/api';
import { useEffect, useState, useCallback } from 'react';

// ────────────────────────── Types ──────────────────────────

interface BuyerDashboardProps {
  orderData: { month: string; orders: number }[];
  hasSellerProfile: boolean;
  onStartSelling: () => void;
  userFirstName: string;
}

interface SellerDashboardProps {
  revenueData: { month: string; revenue: number }[];
  orderData: { month: string; orders: number }[];
  businessName: string;
  isOrdersReceivedOnly?: boolean;
}

// ────────────────────────── Animation helpers ──────────────
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

// ────────────────────────── Status badge variant helper ────

function statusVariant(status: Order['status']): 'success' | 'info' | 'warning' {
  if (status === 'completed') return 'success';
  if (status === 'in-progress') return 'info';
  return 'warning';
}

// ────────────────────────── Main export ────────────────────

export function Dashboard() {
  const { role, businessProfile, hasSellerProfile, hasSellerAccount, showOnboarding, setShowOnboarding, userProfile } = useApp();
  const location = useLocation();

  const isOrdersReceived = location.pathname === '/orders-received';

  if (role === 'buyer' && !isOrdersReceived) {
    return (
      <>
        <BuyerDashboard
          orderData={orderData}
          hasSellerProfile={hasSellerAccount || hasSellerProfile}
          onStartSelling={() => setShowOnboarding(true)}
          userFirstName={userProfile.firstName}
        />
        {showOnboarding && (
          <SellerOnboarding onClose={() => setShowOnboarding(false)} />
        )}
      </>
    );
  }

  return (
    <SellerDashboard
      revenueData={revenueData}
      orderData={orderData}
      businessName={businessProfile?.name || 'Your Business'}
      isOrdersReceivedOnly={isOrdersReceived}
    />
  );
}

// ────────────────────────── Trigger import ────────────────
import { MessageCircle } from 'lucide-react';

// ────────────────────────── Buyer Dashboard ────────────────

function BuyerDashboard({ orderData, hasSellerProfile, onStartSelling, userFirstName }: BuyerDashboardProps) {
  const { t } = useTranslation();
  const { authUser, socketOn, unreadMessageCount } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greetingMorning');
    if (hour < 18) return t('dashboard.greetingAfternoon');
    return t('dashboard.greetingEvening');
  };

  const loadOrders = useCallback(async () => {
    if (authUser?.userId) {
      try {
        const data = await ordersApi.getForUser(authUser.userId);
        // Only show orders where user is buyer
        setOrders(data.filter(o => Number(o.buyer_id) === Number(authUser.userId)));
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [authUser?.userId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const unsubscribe = socketOn('new_notification', (data: any) => {
      if (data && (data.type?.startsWith('order_') || data.type?.includes('price') || data.type?.includes('order'))) {
        loadOrders();
      }
    });
    return unsubscribe;
  }, [loadOrders, socketOn]);

  const activeOrdersCount = orders.filter(o => {
    const s = (o.status || '').trim().toLowerCase();
    return s === 'in-progress' || s === 'in_progress';
  }).length;

  const completedOrdersCount = orders.filter(o => {
    const s = (o.status || '').trim().toLowerCase();
    return s === 'completed';
  }).length;

  const pendingPaymentOrdersCount = orders.filter(o => {
    const s = (o.status || '').trim().toLowerCase();
    return s === 'pending';
  }).length;

  const stats = [
    {
      id: 'active',
      label: t('dashboard.statActiveOrders'),
      value: loading ? '—' : activeOrdersCount.toString(),
      icon: ShoppingCart,
      iconColor: 'text-[#0057B8] dark:text-[#60A5FA]',
      bgColor: 'bg-[#EBF3FC] dark:bg-[#2563EB]/20',
      filterKey: 'in-progress' as const,
    },
    {
      id: 'completed',
      label: t('dashboard.statCompleted'),
      value: loading ? '—' : completedOrdersCount.toString(),
      icon: CheckCircle,
      iconColor: 'text-[#00D084] dark:text-[#34D399]',
      bgColor: 'bg-[#E6FAF0] dark:bg-[#10B981]/20',
      filterKey: 'completed' as const,
    },
    {
      id: 'pending',
      label: t('dashboard.statPendingPayment'),
      value: loading ? '—' : pendingPaymentOrdersCount.toString(),
      icon: Clock,
      iconColor: 'text-[#F5A623] dark:text-[#FBBF24]',
      bgColor: 'bg-[#FEF6E9] dark:bg-[#D97706]/20',
      filterKey: 'pending' as const,
    },
    {
      id: 'messages',
      label: t('dashboard.statMessages'),
      value: (unreadMessageCount || 0).toString(),
      icon: MessageSquare,
      iconColor: 'text-[#B620E0] dark:text-[#E879F9]',
      bgColor: 'bg-[#F8E9FB] dark:bg-[#C026D3]/20',
      link: '/messages',
    },
  ];

  const filteredOrders = orders.filter(o => {
    const s = (o.status || '').trim().toLowerCase();
    if (orderFilter === 'all') return true;
    if (orderFilter === 'in-progress') return s === 'in-progress' || s === 'in_progress';
    return s === orderFilter;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {userFirstName} 👋</h1>
        <p className="text-muted-foreground">{t('dashboard.buyerSubtitle')}</p>
      </div>

      {/* CTA Section (Start Selling & Syncro Assistant) */}
      <motion.div {...fadeInUp}>
        <div className="bg-[#F0F8FA] dark:bg-slate-800/80 border border-[#DCEFF5] dark:border-slate-700/80 rounded-2xl p-6 md:p-8 flex flex-col gap-8 shadow-sm">

          {/* Become a Seller CTA */}
          {!hasSellerProfile && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#DCEFF5]/60 dark:border-slate-700/60">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-[#0089BA] flex items-center justify-center rounded-xl shadow-sm shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.startSellingTitle')}</h3>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-slate-300 text-[15px] max-w-2xl leading-relaxed ml-16">
                  {t('dashboard.startSellingDesc')}
                </p>
              </div>
              <div className="shrink-0 ml-16 md:ml-0">
                <Button
                  onClick={onStartSelling}
                  className="bg-[#0057B8] hover:bg-[#00479A] text-white px-6 py-6 font-semibold text-base rounded-lg shadow-sm w-full md:w-auto"
                >
                  {t('dashboard.createBusinessProfile')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Ask Syncro Assistant CTA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-[#E1F2F7] dark:bg-slate-700/50 flex items-center justify-center rounded-xl border border-[#C6E6F0] dark:border-slate-600/50 shrink-0">
                  <Bot className="w-6 h-6 text-[#0089BA] dark:text-[#38BDF8]" />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.askAssistantTitle')}</h3>
                  <Badge className="bg-[#E1F2F7] hover:bg-[#D5EAF1] dark:bg-slate-700/50 dark:hover:bg-slate-600/50 text-[#0089BA] dark:text-[#38BDF8] border-none text-[10px] uppercase font-bold px-2 py-0.5 tracking-wider">
                    AI HELPER
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 dark:text-slate-300 text-[15px] max-w-2xl leading-relaxed ml-16">
                {t('dashboard.askAssistantDesc')}
              </p>
            </div>
            <div className="shrink-0 ml-16 md:ml-0">
              <SyncroChatTriggerButton />
            </div>
          </div>

        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const isSelected = 'filterKey' in stat && orderFilter === stat.filterKey;
          const cardInner = (
            <Card
              hover
              onClick={() => {
                if ('filterKey' in stat && stat.filterKey) {
                  setOrderFilter(orderFilter === stat.filterKey ? 'all' : stat.filterKey);
                }
              }}
              className={`border shadow-sm rounded-xl overflow-hidden cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/20 shadow-md'
                  : 'border-border/60 hover:border-border'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col h-full justify-between gap-4">
                    <p className="text-[13px] text-gray-500 dark:text-slate-400 font-medium">{stat.label}</p>
                    <p className="text-[32px] font-bold text-gray-900 dark:text-white leading-none">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.iconColor} shrink-0`}>
                    <stat.icon className="w-[22px] h-[22px]" strokeWidth={2.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          return (
            <motion.div key={stat.label} {...fadeInUp} transition={{ delay: index * 0.1 }}>
              {'link' in stat && stat.link ? (
                <Link to={stat.link} className="block">
                  {cardInner}
                </Link>
              ) : (
                cardInner
              )}
            </motion.div>
          );
        })}
      </div>


{/* Pending Price Proposals Alert Banner for Buyer */}
{orders.some(o => o.proposal_status === 'pending' && o.proposed_price) && (
  <motion.div {...fadeInUp}>
    <Card className="border-amber-500/40 bg-amber-500/10 shadow-sm">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">
              Price Revision Proposed by Seller
            </h4>
            <p className="text-xs text-muted-foreground">
              {orders.filter(o => o.proposal_status === 'pending' && o.proposed_price).length} order(s) have a price change waiting for your approval.
            </p>
          </div>
        </div>
        <Link to={`/order/${orders.find(o => o.proposal_status === 'pending' && o.proposed_price)?.id}`}>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs gap-1.5 whitespace-nowrap">
            <DollarSign className="w-3.5 h-3.5" />
            Review Proposal
          </Button>
        </Link>
      </CardContent>
    </Card>
  </motion.div>
)}

{/* Recent Orders */}
<motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
  <Card>
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{t('dashboard.recentOrders')}</h3>
          <Badge variant="outline" className="text-xs font-semibold">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant={orderFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => setOrderFilter('all')}
          >
            All ({orders.length})
          </Button>
          <Button
            variant={orderFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => setOrderFilter('pending')}
          >
            Pending ({pendingPaymentOrdersCount})
          </Button>
          <Button
            variant={orderFilter === 'in-progress' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => setOrderFilter('in-progress')}
          >
            In Progress ({activeOrdersCount})
          </Button>
          <Button
            variant={orderFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => setOrderFilter('completed')}
          >
            Completed ({completedOrdersCount})
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold">{t('dashboard.orderId')}</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">{t('dashboard.service')}</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">{t('dashboard.sellerCol')}</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">{t('common.status')}</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">{t('common.amount')}</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">{t('common.actions', 'Action')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  {t('dashboard.loadingOrders')}
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  {orderFilter !== 'all'
                    ? `No ${orderFilter} orders found.`
                    : t('dashboard.noOrders')}
                </td>
              </tr>
            ) : filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                <td className="py-3 px-4 text-sm font-medium">#{order.id}</td>
                <td className="py-3 px-4 text-sm">{order.service_name}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{order.seller_name || `Seller ${order.seller_id}`}</td>
                <td className="py-3 px-4">
                  <Badge variant={statusVariant(order.status as any)}>
                    {order.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm font-semibold text-right">
                  <span>LKR {order.amount.toLocaleString()}</span>
                  {order.proposal_status === 'pending' && order.proposed_price && (
                    <span className="block text-xs font-medium text-amber-600 dark:text-amber-400">
                      Prop: LKR {order.proposed_price.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {order.proposal_status === 'pending' && order.proposed_price ? (
                    <Link to={`/order/${order.id}`}>
                      <Button size="sm" className="h-8 px-2.5 text-xs gap-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                        <DollarSign className="w-3.5 h-3.5" />
                        Review Price
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/order/${order.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</motion.div>
{/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{t('dashboard.orderActivity')}</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="orders" stroke="var(--primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{t('dashboard.recentActivity')}</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buyerActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">{t('dashboard.noRecentActivity')}</p>
                ) : buyerActivities.map((activity: Activity, index: number) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'info' ? 'bg-blue-500' : 'bg-muted-foreground'
                      }`} />
                    <div className="flex-1">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>


    </div>
  );
}

// ────────────────────────── Trigger Button Helper ────────
function SyncroChatTriggerButton() {
  const { setIsChatOpen } = useApp();
  const { t } = useTranslation();
  return (
  <Button
      onClick={() => setIsChatOpen(true)}
      className="bg-[#0091C2] hover:bg-[#007EA8] text-white px-6 py-6 font-semibold text-base rounded-lg shadow-sm w-full md:w-auto"
    >
      <MessageCircle className="w-5 h-5 mr-3" />
      {t('dashboard.describeYourNeed')}
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  );
}


// ────────────────────────── Seller Dashboard ───────────────

function SellerDashboard({ revenueData, orderData, businessName, isOrdersReceivedOnly }: SellerDashboardProps) {
  const { t } = useTranslation();
  const { authUser, socketOn } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeListingsCount, setActiveListingsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // ── Active status toggle ────────────────────────────────────
  const [isActive, setIsActive] = useState<boolean>(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusReady, setStatusReady] = useState(false);

  // Load current active status from profile on mount
  useEffect(() => {
    async function loadProfile() {
      if (!authUser?.userId) return;
      try {
        const profile = await profilesApi.get(authUser.userId);
        setIsActive(profile.is_active !== false); // default to true if undefined
      } catch {
        // profile not found yet — default to active
      } finally {
        setStatusReady(true);
      }
    }
    loadProfile();
  }, [authUser?.userId]);

  const handleToggleActive = async () => {
    if (statusLoading) return;
    const newVal = !isActive;
    setIsActive(newVal); // optimistic update
    setStatusLoading(true);
    try {
      await profilesApi.setActiveStatus(newVal);
      const { toast } = await import('sonner');
      toast.success(newVal ? 'You are now Active Today!' : 'You are now Unavailable', {
        description: newVal
          ? 'Buyers can see you are open for business.'
          : 'Buyers will see you as unavailable.',
      });
    } catch (e: any) {
      setIsActive(!newVal); // revert on error
      const { toast } = await import('sonner');
      toast.error('Failed to update status', { description: e.message });
    } finally {
      setStatusLoading(false);
    }
  };
  // ───────────────────────────────────────────────────────────

  const loadSellerData = useCallback(async () => {
    if (authUser?.userId) {
      try {
        const [userOrders, allListings] = await Promise.all([
          ordersApi.getForUser(authUser.userId),
          listingsApi.getAll().catch(() => [])
        ]);
        const sellerOrders = userOrders.filter(o => Number(o.seller_id) === Number(authUser.userId));
        setOrders(sellerOrders);
        const myActiveListings = allListings.filter(l => Number(l.seller_id) === Number(authUser.userId));
        setActiveListingsCount(myActiveListings.length);
      } catch (error) {
        console.error("Failed to load seller dashboard data:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [authUser?.userId]);

  useEffect(() => {
    loadSellerData();
  }, [loadSellerData]);

  useEffect(() => {
    const unsubscribe = socketOn('new_notification', (data: any) => {
      if (data && (data.type?.startsWith('order_') || data.type?.includes('price') || data.type?.includes('order'))) {
        loadSellerData();
      }
    });
    return unsubscribe;
  }, [loadSellerData, socketOn]);

  const completedEarnings = orders
    .filter(o => o.status?.toLowerCase() === 'completed')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const totalOrdersAmount = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const displayEarnings = completedEarnings > 0 ? completedEarnings : totalOrdersAmount;

  const stats = [
    {
      label: t('dashboard.statTotalEarnings'),
      value: `LKR ${displayEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      label: t('dashboard.statActiveListings'),
      value: activeListingsCount.toString(),
      icon: Package,
      color: 'text-blue-500',
    },
    {
      label: t('dashboard.statOrdersReceived'),
      value: orders.length.toString(),
      icon: ShoppingCart,
      color: 'text-purple-500',
    },
    {
      label: t('dashboard.statGrowth'),
      value: orders.length > 0 ? '+100%' : '0%',
      icon: TrendingUp,
      color: 'text-teal-500',
    },
  ];

  const filteredOrders = orders.filter(o => {
    const statusMatch = orderFilter === 'all' || (o.status?.toLowerCase() === orderFilter);
    const searchMatch = !orderSearch ||
      o.service_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.buyer_name || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      String(o.id).includes(orderSearch);
    return statusMatch && searchMatch;
  });

  if (isOrdersReceivedOnly) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{t('dashboard.ordersReceivedTitle', 'Orders Received')}</h1>
              <Badge variant="outline" className="text-sm font-semibold px-2.5 py-0.5">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {t('dashboard.ordersReceivedSubtitle', 'Manage incoming customer orders, review deliverables, and update progress.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 mr-1.5 rotate-180" />
                {t('dashboard.backToDashboard', 'Dashboard Overview')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Order Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Action</p>
                <p className="text-2xl font-bold text-amber-600">
                  {orders.filter(o => o.status?.toLowerCase() === 'pending').length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => o.status?.toLowerCase() === 'in-progress').length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600">
                <Package className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {orders.filter(o => o.status?.toLowerCase() === 'completed').length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Orders Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search service, buyer, or #ID..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg text-xs font-medium self-start sm:self-auto">
                {(['all', 'pending', 'in-progress', 'completed'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setOrderFilter(tab)}
                    className={`px-3 py-1.5 rounded-md transition-all capitalize ${
                      orderFilter === tab
                        ? 'bg-background text-foreground shadow-sm font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'all' ? 'All Orders' : tab.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold">{t('dashboard.orderId', 'Order ID')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">{t('dashboard.service', 'Service')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">{t('dashboard.buyerCol', 'Buyer')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">{t('common.status', 'Status')}</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">{t('common.amount', 'Amount')}</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                        Loading orders...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-medium text-muted-foreground">
                          {orders.length === 0 ? t('dashboard.noOrdersReceived', 'No orders received yet.') : 'No orders match your filter.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-semibold">#{order.id}</td>
                        <td className="py-3 px-4 text-sm font-medium max-w-xs truncate">{order.service_name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {order.buyer_name || `Buyer #${order.buyer_id}`}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusVariant(order.status as any)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-right">
                          <span>LKR {order.amount.toLocaleString()}</span>
                          {order.proposal_status === 'pending' && order.proposed_price && (
                            <span className="block text-xs font-medium text-amber-600 dark:text-amber-400">
                              Prop: LKR {order.proposed_price.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/order/${order.id}`}>
                              <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                View Order
                              </Button>
                            </Link>
                            {order.buyer_id && (
                              <Link to={`/messages?userId=${order.buyer_id}&name=${encodeURIComponent(order.buyer_name || `Buyer ${order.buyer_id}`)}`}>
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" title="Message Buyer">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{businessName} {t('dashboard.sellerDashboardTitle')}</h1>
          <p className="text-muted-foreground">{t('dashboard.sellerSubtitle')}</p>
        </div>

        {/* Active/Inactive toggle */}
        <div className="flex items-center gap-3">
          {statusReady && (
            <motion.button
              id="seller-active-toggle"
              onClick={handleToggleActive}
              disabled={statusLoading}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 font-semibold text-sm transition-all duration-300 select-none ${
                isActive
                  ? 'bg-[#E1F2F7] border-[#0089BA] text-[#0057B8] dark:bg-[#0089BA]/20 dark:border-[#38BDF8] dark:text-[#38BDF8]'
                  : 'bg-muted/60 border-border text-muted-foreground'
              } ${statusLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}`}
              whileTap={{ scale: 0.97 }}
            >
              {/* Animated dot */}
              <span className="relative flex items-center justify-center w-5 h-5">
                {statusLoading ? (
                  <span className={`w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin block`} />
                ) : (
                  <>
                    <span
                      className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        isActive ? 'bg-[#0089BA] scale-100' : 'bg-muted-foreground/40 scale-75'
                      }`}
                    />
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-[#0089BA] animate-ping opacity-60" />
                    )}
                  </>
                )}
              </span>

              {/* Label */}
              <span className="transition-all duration-200">
                {statusLoading ? t('dashboard.updating') : isActive ? t('dashboard.activeToday') : t('dashboard.unavailable')}
              </span>

              {/* Pill toggle track */}
              <span
                className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                  isActive ? 'bg-[#0089BA]' : 'bg-muted-foreground/30'
                }`}
              >
                <motion.span
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                  animate={{ x: isActive ? 18 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </span>
            </motion.button>
          )}

          <Link to="/listings">
            <Button>{t('dashboard.createNewListing')}</Button>
          </Link>
        </div>
      </div>

      {/* Profile Completion Banner */}
      <motion.div {...fadeInUp}>
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">{t('dashboard.completeProfile')}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('dashboard.completeProfileDesc')}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 max-w-xs h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4"></div>
                  </div>
                  <span className="text-sm font-semibold">75%</span>
                </div>
              </div>
              <Link to="/settings">
                <Button variant="outline">{t('dashboard.completeProfileButton')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} {...fadeInUp} transition={{ delay: index * 0.1 }}>
            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t('dashboard.recentOrdersReceived')}</h3>
              <Link to="/orders-received">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold">{t('dashboard.orderId')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">{t('dashboard.service')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">{t('dashboard.buyerCol')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">{t('common.status')}</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">{t('common.amount')}</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">{t('common.actions', 'Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        Loading orders...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        {t('dashboard.noOrdersReceived')}
                      </td>
                    </tr>
                  ) : orders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm font-medium">#{order.id}</td>
                      <td className="py-3 px-4 text-sm">{order.service_name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{order.buyer_name || `Buyer ${order.buyer_id}`}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusVariant(order.status as any)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-right">
                        <span>LKR {order.amount.toLocaleString()}</span>
                        {order.proposal_status === 'pending' && order.proposed_price && (
                          <span className="block text-xs font-medium text-amber-600 dark:text-amber-400">
                            Prop: LKR {order.proposed_price.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/order/${order.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{t('dashboard.revenueOverview')}</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{t('dashboard.ordersTrend')}</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="orders" stroke="var(--accent)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}