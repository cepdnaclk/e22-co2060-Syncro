import React from 'react';
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
  Bot
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { SellerOnboarding } from '../components/SellerOnboarding';
import { buyerOrders, sellerOrders, buyerActivities, revenueData, orderData } from '../services/mockData';
import type { Activity, Order } from '../services/mockData';

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
  const { role, businessProfile, hasSellerProfile, showOnboarding, setShowOnboarding, userProfile } = useApp();

  if (role === 'buyer') {
    return (
      <>
        <BuyerDashboard
          orderData={orderData}
          hasSellerProfile={hasSellerProfile}
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
    />
  );
}

// ────────────────────────── Trigger import ────────────────
import { MessageCircle } from 'lucide-react';

// ────────────────────────── Buyer Dashboard ────────────────

function BuyerDashboard({ orderData, hasSellerProfile, onStartSelling, userFirstName }: BuyerDashboardProps) {
  const stats = [
    { label: 'Active Orders', value: '0', icon: ShoppingCart, iconColor: 'text-[#0057B8] dark:text-[#60A5FA]', bgColor: 'bg-[#EBF3FC] dark:bg-[#2563EB]/20' },
    { label: 'Completed', value: '0', icon: CheckCircle, iconColor: 'text-[#00D084] dark:text-[#34D399]', bgColor: 'bg-[#E6FAF0] dark:bg-[#10B981]/20' },
    { label: 'Pending Payment', value: '0', icon: Clock, iconColor: 'text-[#F5A623] dark:text-[#FBBF24]', bgColor: 'bg-[#FEF6E9] dark:bg-[#D97706]/20' },
    { label: 'Messages', value: '0', icon: MessageSquare, iconColor: 'text-[#B620E0] dark:text-[#E879F9]', bgColor: 'bg-[#F8E9FB] dark:bg-[#C026D3]/20' },
  ];


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {userFirstName} 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your orders.</p>
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
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Start Selling on Syncro</h3>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-slate-300 text-[15px] max-w-2xl leading-relaxed ml-16">
                  Create a business profile and offer your products and services. Reach buyers, manage orders, and grow your business with our powerful tools.
                </p>
              </div>
              <div className="shrink-0 ml-16 md:ml-0">
                <Button
                  onClick={onStartSelling}
                  className="bg-[#0057B8] hover:bg-[#00479A] text-white px-6 py-6 font-semibold text-base rounded-lg shadow-sm w-full md:w-auto"
                >
                  Create Business Profile
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
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ask Syncro Assistant</h3>
                  <Badge className="bg-[#E1F2F7] hover:bg-[#D5EAF1] dark:bg-slate-700/50 dark:hover:bg-slate-600/50 text-[#0089BA] dark:text-[#38BDF8] border-none text-[10px] uppercase font-bold px-2 py-0.5 tracking-wider">
                    AI HELPER
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 dark:text-slate-300 text-[15px] max-w-2xl leading-relaxed ml-16">
                Need something done? Describe your needs here and Syncro Assistant will guide you to the best service.
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
        {stats.map((stat, index) => (
          <motion.div key={stat.label} {...fadeInUp} transition={{ delay: index * 0.1 }}>
            <Card hover className="border border-border/60 shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col h-full justify-between gap-4">
                    <p className="text-[13px] text-gray-500">{stat.label}</p>
                    <p className="text-[32px] font-bold text-gray-900 leading-none">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.iconColor} shrink-0`}>
                    <stat.icon className="w-[22px] h-[22px]" strokeWidth={2.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>


      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Order Activity</h3>
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
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buyerActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No recent activity yet.</p>
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

      {/* Recent Orders */}
      <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <Link to="/orders">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Service</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Seller</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {buyerOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        No orders yet. Browse services to place your first order.
                      </td>
                    </tr>
                  ) : buyerOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm font-medium">{order.id}</td>
                      <td className="py-3 px-4 text-sm">{order.service}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{order.seller}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-right">${order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ────────────────────────── Trigger Button Helper ────────
function SyncroChatTriggerButton() {
  const { setIsChatOpen } = useApp();
  return (
    <Button
      onClick={() => setIsChatOpen(true)}
      className="bg-[#0091C2] hover:bg-[#007EA8] text-white px-6 py-6 font-semibold text-base rounded-lg shadow-sm w-full md:w-auto"
    >
      <MessageCircle className="w-5 h-5 mr-3" />
      Describe Your Need
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  );
}

// ────────────────────────── Seller Dashboard ───────────────

function SellerDashboard({ revenueData, orderData, businessName }: SellerDashboardProps) {
  const stats = [
    { label: 'Total Earnings', value: '$0', icon: DollarSign, color: 'text-green-500' },
    { label: 'Active Listings', value: '0', icon: Package, color: 'text-blue-500' },
    { label: 'Orders Received', value: '0', icon: ShoppingCart, color: 'text-purple-500' },
    { label: 'Growth', value: '0%', icon: TrendingUp, color: 'text-teal-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{businessName} Dashboard</h1>
          <p className="text-muted-foreground">Manage your business and track your performance.</p>
        </div>
        <Link to="/listings">
          <Button>Create New Listing</Button>
        </Link>
      </div>

      {/* Profile Completion Banner */}
      <motion.div {...fadeInUp}>
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Add more details to attract more customers
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 max-w-xs h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4"></div>
                  </div>
                  <span className="text-sm font-semibold">75%</span>
                </div>
              </div>
              <Link to="/settings">
                <Button variant="outline">Complete Profile</Button>
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Revenue Overview</h3>
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

        <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Orders Trend</h3>
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

      {/* Recent Orders */}
      <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Orders Received</h3>
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
                    <th className="text-left py-3 px-4 text-sm font-semibold">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Service</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Buyer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        No orders received yet. Create listings to start getting orders.
                      </td>
                    </tr>
                  ) : sellerOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm font-medium">{order.id}</td>
                      <td className="py-3 px-4 text-sm">{order.service}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{order.buyer}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-right">${order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}