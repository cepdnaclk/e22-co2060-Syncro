import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Ban,
  CreditCard,
  ArrowUpRight,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { adminApi, AdminMetrics, AdminUser, AdminOrder } from '../services/api';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';

export function AdminDashboard() {
  const { authUser } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'payouts'>('overview');

  // Metrics state
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userBanFilter, setUserBanFilter] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Orders / Payments state
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [unverifiedOnly, setUnverifiedOnly] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Payouts state
  const [payoutOrders, setPayoutOrders] = useState<AdminOrder[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  // Modal states
  const [selectedSlipOrder, setSelectedSlipOrder] = useState<AdminOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);

  const [deleteTargetUser, setDeleteTargetUser] = useState<AdminUser | null>(null);
  const [settleTargetOrder, setSettleTargetOrder] = useState<AdminOrder | null>(null);
  const [payoutReference, setPayoutReference] = useState('');

  // Initial load
  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'payments') fetchOrders();
    if (activeTab === 'payouts') fetchPayouts();
  }, [activeTab]);

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const data = await adminApi.getMetrics();
      setMetrics(data);
    } catch (err: any) {
      toast.error('Failed to load admin metrics: ' + err.message);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const isBanned = userBanFilter === '' ? undefined : userBanFilter === 'true';
      const role = userRoleFilter || undefined;
      const data = await adminApi.getUsers(userSearch || undefined, role, isBanned);
      setUsers(data.users);
      setUserTotal(data.total);
    } catch (err: any) {
      toast.error('Failed to load users: ' + err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await adminApi.getOrders(unverifiedOnly);
      setOrders(data);
    } catch (err: any) {
      toast.error('Failed to load payment orders: ' + err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchPayouts = async () => {
    setLoadingPayouts(true);
    try {
      const data = await adminApi.getOrders(false, true);
      setPayoutOrders(data);
    } catch (err: any) {
      toast.error('Failed to load payout queue: ' + err.message);
    } finally {
      setLoadingPayouts(false);
    }
  };

  // User Actions
  const handleToggleBan = async (user: AdminUser) => {
    if (user.email === 'syncromarketplace@gmail.com') {
      toast.error('Cannot ban platform administrator!');
      return;
    }
    try {
      const res = await adminApi.toggleBan(user.id);
      toast.success(res.message);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_banned: res.is_banned } : u));
      fetchMetrics();
    } catch (err: any) {
      toast.error('Failed to update ban status: ' + err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    if (deleteTargetUser.email === 'syncromarketplace@gmail.com') {
      toast.error('Cannot delete platform administrator!');
      return;
    }
    setActionProcessing(true);
    try {
      const res = await adminApi.deleteUser(deleteTargetUser.id);
      toast.success(res.message);
      setUsers(prev => prev.filter(u => u.id !== deleteTargetUser.id));
      setDeleteTargetUser(null);
      fetchMetrics();
    } catch (err: any) {
      toast.error('Failed to delete user: ' + err.message);
    } finally {
      setActionProcessing(false);
    }
  };

  // Slip / Payment verification
  const handleVerifyPayment = async (orderId: number, action: 'approve' | 'reject') => {
    setActionProcessing(true);
    try {
      const res = await adminApi.verifyPayment(orderId, action, action === 'reject' ? rejectReason : undefined);
      toast.success(res.message);
      setSelectedSlipOrder(null);
      setShowRejectInput(false);
      setRejectReason('');
      fetchOrders();
      fetchMetrics();
    } catch (err: any) {
      toast.error('Payment verification failed: ' + err.message);
    } finally {
      setActionProcessing(false);
    }
  };

  // Settle Payout
  const handleSettlePayout = async () => {
    if (!settleTargetOrder) return;
    setActionProcessing(true);
    try {
      const res = await adminApi.settlePayout(settleTargetOrder.id, payoutReference || undefined);
      toast.success(res.message);
      setSettleTargetOrder(null);
      setPayoutReference('');
      fetchPayouts();
      fetchMetrics();
    } catch (err: any) {
      toast.error('Failed to settle payout: ' + err.message);
    } finally {
      setActionProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Shield className="w-3.5 h-3.5" /> Super Admin Portal
                </span>
                <span className="text-xs text-muted-foreground">Signed in as {authUser?.email}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-2">
                Platform Operations & Moderation
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchMetrics();
                  if (activeTab === 'users') fetchUsers();
                  if (activeTab === 'payments') fetchOrders();
                  if (activeTab === 'payouts') fetchPayouts();
                  toast.success('Admin data refreshed');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border bg-background hover:bg-muted transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Refresh Data
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border mt-6 overflow-x-auto gap-2">
            {[
              { id: 'overview', label: 'Overview Metrics', icon: TrendingUp },
              { id: 'users', label: 'User Moderation', icon: Users, badge: metrics?.banned_users ? `${metrics.banned_users} banned` : undefined },
              { id: 'payments', label: 'Bank Slip & QR Verification', icon: CreditCard, badge: metrics?.pending_verification_orders ? `${metrics.pending_verification_orders} pending` : undefined },
              { id: 'payouts', label: 'Seller Escrow Payouts', icon: DollarSign },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* =================== TAB 1: OVERVIEW METRICS =================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-foreground">
                    {metrics?.total_users ?? (metrics as any)?.users?.total ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span>{metrics?.total_buyers ?? (metrics as any)?.users?.buyers ?? 0} buyers</span>
                    <span>•</span>
                    <span>{metrics?.total_sellers ?? (metrics as any)?.users?.sellers ?? 0} sellers</span>
                    <span>•</span>
                    <span className="text-destructive font-medium">
                      {metrics?.banned_users ?? (metrics as any)?.users?.banned ?? 0} banned
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Pending Slip Checks</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-amber-500">
                    {metrics?.pending_verification_orders ?? (metrics as any)?.orders?.pending_slips ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Bank transfers/QR slips waiting for manual review
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Escrow Holding</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-foreground">
                    LKR {((metrics?.escrow_holding_amount ?? (metrics as any)?.financials?.escrow_holding) ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Funds currently locked safe in escrow
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Platform Revenue (5%)</span>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-primary">
                    LKR {((metrics?.platform_revenue_collected ?? (metrics as any)?.financials?.platform_revenue) ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Total commissions earned on completed orders
                  </div>
                </div>
              </div>
            </div>

            {/* Order Flow Summary */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Platform Order Status Breakdown</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <span className="text-xs text-muted-foreground font-medium">All Time Orders</span>
                  <div className="text-2xl font-bold mt-1">
                    {metrics?.total_orders ?? (metrics as any)?.orders?.total ?? 0}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <span className="text-xs text-blue-500 font-medium">Active (In Escrow)</span>
                  <div className="text-2xl font-bold text-blue-500 mt-1">
                    {metrics?.active_orders ?? (metrics as any)?.orders?.in_progress ?? 0}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-xs text-emerald-500 font-medium">Completed & Released</span>
                  <div className="text-2xl font-bold text-emerald-500 mt-1">
                    {metrics?.completed_orders ?? (metrics as any)?.orders?.completed ?? 0}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <span className="text-xs text-destructive font-medium">Cancelled / Rejected</span>
                  <div className="text-2xl font-bold text-destructive mt-1">
                    {metrics?.cancelled_orders ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => setActiveTab('payments')}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        Review Bank Slips & QR Payments
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {metrics?.pending_verification_orders ?? 0} payment slips waiting for approval
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('users')}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        Manage & Moderate Platform Users
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Search buyers & sellers, ban malicious accounts, or delete users
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================== TAB 2: USER MODERATION =================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={userRoleFilter}
                    onChange={e => { setUserRoleFilter(e.target.value); }}
                    className="px-3 py-2 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none"
                  >
                    <option value="">All Roles</option>
                    <option value="client">Buyers (Client)</option>
                    <option value="seller">Sellers</option>
                  </select>

                  <select
                    value={userBanFilter}
                    onChange={e => { setUserBanFilter(e.target.value); }}
                    className="px-3 py-2 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="false">Active Only</option>
                    <option value="true">Banned Only</option>
                  </select>

                  <button
                    onClick={fetchUsers}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">
                  Showing {users.length} of {userTotal} registered users
                </span>
              </div>

              {loadingUsers ? (
                <div className="p-12 text-center text-muted-foreground">Loading users list...</div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">No users found matching query.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-medium border-b border-border">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Verification</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map(u => {
                        const isSuperAdmin = u.email === 'syncromarketplace@gmail.com';
                        return (
                          <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-foreground flex items-center gap-1.5">
                                {u.first_name} {u.last_name}
                                {isSuperAdmin && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{u.email}</div>
                              {u.phone_number && <div className="text-[11px] text-muted-foreground">{u.phone_number}</div>}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                u.active_role === 'seller' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'
                              }`}>
                                {u.active_role === 'client' ? 'Buyer' : u.active_role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">
                              {u.location || 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              {u.email_verified ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                                  <Clock className="w-3.5 h-3.5" /> Pending OTP
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {u.is_banned ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/15 text-destructive">
                                  <Ban className="w-3 h-3" /> BANNED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active Member'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {isSuperAdmin ? (
                                <span className="text-xs text-muted-foreground italic">Protected</span>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleToggleBan(u)}
                                    title={u.is_banned ? 'Unban User' : 'Ban User'}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                                      u.is_banned
                                        ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                                    }`}
                                  >
                                    <Ban className="w-3 h-3" />
                                    {u.is_banned ? 'Unban' : 'Ban'}
                                  </button>

                                  <button
                                    onClick={() => setDeleteTargetUser(u)}
                                    title="Delete User Account"
                                    className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================== TAB 3: BANK SLIP & QR VERIFICATION =================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Manual Payment Verification Queue</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verify buyer uploads (direct bank transfer slips or QR scan receipts) to release order to seller.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setUnverifiedOnly(true); fetchOrders(); }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                    unverifiedOnly
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 border-border text-muted-foreground'
                  }`}
                >
                  Unverified Only
                </button>
                <button
                  onClick={() => { setUnverifiedOnly(false); fetchOrders(); }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                    !unverifiedOnly
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 border-border text-muted-foreground'
                  }`}
                >
                  All Orders
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              {loadingOrders ? (
                <div className="p-12 text-center text-muted-foreground">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No orders currently awaiting manual payment verification.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-medium border-b border-border">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Buyer</th>
                        <th className="py-3 px-4">Seller</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Verification</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.map(order => {
                        const price = Number(order.total_price ?? order.amount ?? 0);
                        const serviceName = order.service_title || order.service_name || 'Custom Service';
                        const createdAt = order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A';
                        return (
                          <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-mono font-medium text-xs">
                              #{order.id}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-foreground line-clamp-1">{serviceName}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {createdAt}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-foreground">{order.buyer?.name || 'Buyer'}</div>
                              <div className="text-[11px] text-muted-foreground">{order.buyer?.email || ''}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-foreground">{order.seller?.name || 'Seller'}</div>
                            </td>
                            <td className="py-3 px-4 font-bold text-foreground">
                              LKR {price.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="capitalize text-xs font-medium px-2 py-0.5 bg-muted rounded-md border border-border">
                                {order.payment_method}
                              </span>
                            </td>
                          <td className="py-3 px-4">
                            {order.payment_verified ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                              </span>
                            ) : order.rejection_reason ? (
                              <span className="inline-flex items-center gap-1 text-xs text-destructive font-semibold bg-destructive/10 px-2 py-0.5 rounded-full" title={order.rejection_reason}>
                                <XCircle className="w-3.5 h-3.5" /> Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                                <Clock className="w-3.5 h-3.5" /> Pending Check
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedSlipOrder(order);
                                setShowRejectInput(false);
                                setRejectReason('');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Review Slip
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================== TAB 4: SELLER ESCROW PAYOUTS =================== */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">Seller Payout Settlement Queue</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Orders where the buyer has verified completion and approved escrow release. Platform retains 5% commission; remaining 95% is owed to the seller via direct bank transfer.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              {loadingPayouts ? (
                <div className="p-12 text-center text-muted-foreground">Loading payouts queue...</div>
              ) : payoutOrders.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No completed orders currently waiting for payout settlement. All sellers have been paid!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-medium border-b border-border">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Completed Date</th>
                        <th className="py-3 px-4">Seller Recipient</th>
                        <th className="py-3 px-4">Total Order</th>
                        <th className="py-3 px-4">Syncro Fee (5%)</th>
                        <th className="py-3 px-4 font-bold text-emerald-600">Net Due to Seller (95%)</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {payoutOrders.map(order => {
                        const price = Number(order.total_price ?? order.amount ?? 0);
                        const fee = Math.round(price * 0.05);
                        const netPayout = price - fee;
                        const createdAt = order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A';
                        return (
                          <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-mono font-medium text-xs">
                              #{order.id}
                            </td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">
                              {createdAt}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-foreground">{order.seller?.name || 'Seller'}</div>
                              <div className="text-xs text-muted-foreground">{order.seller?.phone || order.seller?.email || 'Seller ID ' + order.seller_id}</div>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              LKR {price.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-xs text-primary font-medium">
                              LKR {fee.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-bold text-emerald-600">
                              LKR {netPayout.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setSettleTargetOrder(order);
                                  setPayoutReference('');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" /> Mark Paid
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =================== MODAL: SLIP PREVIEW & APPROVE/REJECT =================== */}
      {selectedSlipOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">Review Bank Slip / QR Screenshot</h3>
                <p className="text-xs text-muted-foreground">Order #{selectedSlipOrder.id} • LKR {Number(selectedSlipOrder.total_price ?? selectedSlipOrder.amount ?? 0).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedSlipOrder(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Slip image display */}
            <div className="my-5 flex flex-col items-center">
              {(selectedSlipOrder.bank_slip_url || selectedSlipOrder.payment_slip_url) ? (
                <div className="space-y-2 w-full">
                  <div className="max-h-96 overflow-hidden rounded-xl border border-border bg-black/5 flex items-center justify-center">
                    <img
                      src={selectedSlipOrder.bank_slip_url || selectedSlipOrder.payment_slip_url}
                      alt="Bank Transfer Slip"
                      className="max-h-96 object-contain rounded-lg"
                      onError={(e) => {
                        // In case of broken external link, show fallback
                        (e.target as any).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <a
                      href={selectedSlipOrder.bank_slip_url || selectedSlipOrder.payment_slip_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open original image in new tab
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border w-full">
                  <FileText className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
                  <p className="text-sm font-medium">No direct image URL recorded</p>
                  <p className="text-xs text-muted-foreground mt-1">Payment Method: {selectedSlipOrder.payment_method}</p>
                </div>
              )}

              {/* Order summary info */}
              <div className="grid grid-cols-2 gap-3 w-full mt-4 text-xs bg-muted/40 p-4 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground">Buyer:</span>
                  <div className="font-semibold text-foreground">{selectedSlipOrder.buyer?.name} ({selectedSlipOrder.buyer?.email})</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Seller:</span>
                  <div className="font-semibold text-foreground">{selectedSlipOrder.seller?.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Expected:</span>
                  <div className="font-bold text-foreground">LKR {Number(selectedSlipOrder.total_price ?? selectedSlipOrder.amount ?? 0).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Status:</span>
                  <div className="font-semibold capitalize text-foreground">{selectedSlipOrder.order_status || selectedSlipOrder.status}</div>
                </div>
              </div>
            </div>

            {/* Reject reason input */}
            {showRejectInput && (
              <div className="mb-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <label className="block text-xs font-semibold text-destructive mb-1">
                  Reason for Rejecting Slip (will be visible to buyer):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amount mismatch, blur screenshot, invalid bank ref..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              {!showRejectInput ? (
                <>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={actionProcessing}
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    Reject Slip
                  </button>
                  <button
                    onClick={() => handleVerifyPayment(selectedSlipOrder.id, 'approve')}
                    disabled={actionProcessing}
                    className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    {actionProcessing ? 'Approving...' : '✓ Approve & Move to Escrow'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectInput(false)}
                    disabled={actionProcessing}
                    className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleVerifyPayment(selectedSlipOrder.id, 'reject')}
                    disabled={actionProcessing || !rejectReason.trim()}
                    className="px-5 py-2 text-sm font-semibold rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {actionProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================== MODAL: DELETE USER CONFIRMATION =================== */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Permanently Delete User?</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Are you sure you want to delete <strong className="text-foreground">{deleteTargetUser.first_name} {deleteTargetUser.last_name}</strong> ({deleteTargetUser.email})?
              This will remove their profile and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteTargetUser(null)}
                disabled={actionProcessing}
                className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionProcessing}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                {actionProcessing ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== MODAL: SETTLE PAYOUT =================== */}
      {settleTargetOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Confirm Seller Bank Payout</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Mark payout for Order #{settleTargetOrder.id} as settled.
            </p>

            <div className="my-4 p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seller:</span>
                <span className="font-semibold text-foreground">{settleTargetOrder.seller?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Total:</span>
                <span className="font-semibold text-foreground">LKR {Number(settleTargetOrder.total_price ?? settleTargetOrder.amount ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee (5%):</span>
                <span className="font-semibold text-primary">LKR {Math.round(Number(settleTargetOrder.total_price ?? settleTargetOrder.amount ?? 0) * 0.05).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-border pt-2">
                <span>Net Transfer Amount:</span>
                <span className="text-emerald-600">LKR {(Number(settleTargetOrder.total_price ?? settleTargetOrder.amount ?? 0) - Math.round(Number(settleTargetOrder.total_price ?? settleTargetOrder.amount ?? 0) * 0.05)).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Bank Transfer Reference / Notes (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. CEFT REF #849202, Sampath Bank transfer"
                value={payoutReference}
                onChange={e => setPayoutReference(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setSettleTargetOrder(null)}
                disabled={actionProcessing}
                className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSettlePayout}
                disabled={actionProcessing}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                {actionProcessing ? 'Saving...' : 'Confirm Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
