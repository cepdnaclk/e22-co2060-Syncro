import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  MessageSquare,
  Download,
  DollarSign,
  Star,
  Loader2,
  AlertCircle,
  ArrowRight,
  Check,
  X,
  Send,
  Play,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { ReviewModal } from '../components/ReviewModal';
import { useApp } from '../context/AppContext';
import { ordersApi, messagesApi, Order } from '../services/api';
import { toast } from 'sonner';

export function OrderDetail() {
  const { id } = useParams();
  const { role, authUser, socketOn } = useApp();
  const [message, setMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [proposing, setProposing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [responding, setResponding] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      const updated = await ordersApi.updateStatus(order.id, newStatus);
      setOrder(updated);
      toast.success(
        newStatus === 'in-progress'
          ? 'Order marked as In Progress! The buyer has been notified.'
          : newStatus === 'completed'
          ? 'Order marked as Completed!'
          : `Order status updated to ${newStatus}.`
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      const data = await ordersApi.getById(Number(id));
      setOrder(data);
      setError(null);
    } catch (err: any) {
      if (authUser?.userId) {
        try {
          const userOrders = await ordersApi.getForUser(authUser.userId);
          const found = userOrders.find((o) => o.id === Number(id)) ?? null;
          if (found) {
            setOrder(found);
            setError(null);
            return;
          }
        } catch {
          // ignore
        }
      }
      setError(err.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [id, authUser?.userId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Real-time: update order when socket notification arrives for this order
  useEffect(() => {
    if (!id) return;
    const unsubscribe = socketOn('new_notification', (data: any) => {
      if (
        data &&
        (data.type?.startsWith('order_') || data.type?.includes('price') || data.type?.includes('order')) &&
        Number(data.reference_id) === Number(id)
      ) {
        fetchOrder();
      }
    });
    return unsubscribe;
  }, [id, fetchOrder, socketOn]);

  // Determine user identity relative to this order:
  // If the logged-in user matches buyer_id or seller_id, that takes precedence.
  // Otherwise fall back to the currently selected role.
  const isOrderBuyer = order && authUser
    ? Number(order.buyer_id) === Number(authUser.userId)
    : role === 'buyer';

  const isOrderSeller = order && authUser
    ? Number(order.seller_id) === Number(authUser.userId)
    : role === 'seller';

  const handleProposePrice = async () => {
    const val = parseFloat(proposedPrice);
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter a valid price greater than 0.');
      return;
    }
    if (val === order?.amount) {
      toast.error('Proposed price must be different from the current price.');
      return;
    }
    if (!order) return;
    setProposing(true);
    try {
      const updated = await ordersApi.proposePrice(order.id, val);
      setOrder(updated);
      setProposedPrice('');
      toast.success(`Price proposal of LKR ${val.toLocaleString()} submitted to buyer!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit price proposal.');
    } finally {
      setProposing(false);
    }
  };

  const handleCancelProposal = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const updated = await ordersApi.cancelProposal(order.id);
      setOrder(updated);
      toast.success('Price proposal cancelled.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel proposal.');
    } finally {
      setCancelling(false);
    }
  };

  const handleRespondProposal = async (action: 'accept' | 'reject') => {
    if (!order) return;
    setResponding(true);
    try {
      const updated = await ordersApi.respondProposal(order.id, action);
      setOrder(updated);
      if (action === 'accept') {
        toast.success(`Price proposal accepted! Order price is now LKR ${updated.amount.toLocaleString()}.`);
      } else {
        toast.info('Price proposal declined.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to respond to price proposal.');
    } finally {
      setResponding(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !order) return;
    const recipientId = isOrderSeller ? order.buyer_id : order.seller_id;
    if (!recipientId) {
      toast.error('Recipient not found.');
      return;
    }
    setSendingMessage(true);
    try {
      await messagesApi.send(recipientId, message.trim());
      toast.success('Message sent!');
      setMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Called by ReviewModal after a successful submission
  const handleReviewSuccess = () => {
    if (order) setOrder({ ...order, has_review: true });
    setShowReviewModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading order…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!order ? (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4 opacity-60" />
            <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">{error || `We couldn't find order #${id}`}</p>
            <Link to="/dashboard" className="mt-4">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                <p className="text-muted-foreground">
                  {order.service_name} · {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant={
                order.status === 'completed' ? 'success' :
                  order.status === 'in-progress' ? 'info' : 'warning'
              } className="text-sm px-3 py-1">
                {order.status.replace('-', ' ')}
              </Badge>
              {isOrderSeller && order.status === 'pending' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus('in-progress')}
                  disabled={updatingStatus}
                  className="bg-[#0089BA] hover:bg-[#00739c] text-white gap-1.5 shadow-sm text-xs font-semibold h-8"
                >
                  {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  Mark as In Progress
                </Button>
              )}
              {isOrderSeller && order.status === 'in-progress' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={updatingStatus}
                  className="bg-[#00D084] hover:bg-[#00b572] text-white gap-1.5 shadow-sm text-xs font-semibold h-8"
                >
                  {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Mark as Completed
                </Button>
              )}
            </div>
          </div>

          {/* ── Review prompt (buyer only, completed order, not yet reviewed) ── */}
          {isOrderBuyer && order.status === 'completed' && !order.has_review && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">How was your experience?</h3>
                        <p className="text-sm text-muted-foreground">Your rating helps other buyers choose great sellers</p>
                      </div>
                    </div>
                    <Button onClick={() => setShowReviewModal(true)} className="gap-2">
                      <Star className="w-4 h-4" />
                      Leave a Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── Already reviewed banner ── */}
          {isOrderBuyer && order.status === 'completed' && order.has_review && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-sm font-medium text-green-700">You have already reviewed this order. Thank you!</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* ── Main column ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* ── Buyer: Price Proposal Review Card ── */}
              {isOrderBuyer && order.proposal_status === 'pending' && order.proposed_price && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-amber-500/40 bg-amber-500/5 shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                            <DollarSign className="w-5 h-5 text-amber-500" />
                            Seller Proposed a Price Change
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {order.seller_name || 'The seller'} proposed a new price for this order. Review and decide whether to accept the revised amount.
                          </p>
                        </div>
                        <Badge variant="warning" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                          Decision Required
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 p-4 bg-card border border-border rounded-xl">
                        <div>
                          <span className="text-xs text-muted-foreground block mb-0.5">Current Price</span>
                          <span className="text-base font-medium line-through text-muted-foreground">
                            LKR {order.amount.toLocaleString()}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <span className="text-xs text-primary font-medium block mb-0.5">Proposed Price</span>
                          <span className="text-2xl font-bold text-primary">
                            LKR {order.proposed_price.toLocaleString()}
                          </span>
                        </div>
                        {order.proposal_note && (
                          <div className="w-full pt-2 border-t border-border text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Note from seller:</span> {order.proposal_note}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleRespondProposal('accept')}
                          disabled={responding}
                          className="gap-2 bg-primary hover:bg-primary/90"
                        >
                          {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Accept LKR {order.proposed_price.toLocaleString()}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRespondProposal('reject')}
                          disabled={responding}
                          className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                        >
                          <X className="w-4 h-4" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Order Timeline */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold">Order Timeline</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {[
                        { label: 'Order Placed', completed: true },
                        { label: 'In Progress', completed: order.status === 'in-progress' || order.status === 'completed' },
                        { label: 'Completed', completed: order.status === 'completed' },
                      ].map((item, index, arr) => (
                        <div key={item.label} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              item.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {item.completed ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>
                            {index < arr.length - 1 && (
                              <div className={`w-0.5 h-12 ${item.completed ? 'bg-primary' : 'bg-muted'}`} />
                            )}
                          </div>
                          <div className="flex-1 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="font-semibold mb-0.5">{item.label}</h4>
                              <p className="text-xs text-muted-foreground">
                                {item.completed
                                  ? (item.label === 'Completed' ? 'Service delivered & completed' : item.label === 'In Progress' ? 'Work is currently in progress' : 'Order successfully placed')
                                  : (item.label === 'In Progress' ? 'Awaiting seller to start work' : 'Pending completion')}
                              </p>
                            </div>
                            {!item.completed && isOrderSeller && order.status === 'pending' && item.label === 'In Progress' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus('in-progress')}
                                disabled={updatingStatus}
                                className="bg-[#0089BA] hover:bg-[#00739c] text-white gap-1.5 text-xs h-8 font-semibold shadow-sm self-start sm:self-auto"
                              >
                                {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                                Start Order
                              </Button>
                            )}
                            {!item.completed && isOrderSeller && order.status === 'in-progress' && item.label === 'Completed' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus('completed')}
                                disabled={updatingStatus}
                                className="bg-[#00D084] hover:bg-[#00b572] text-white gap-1.5 text-xs h-8 font-semibold shadow-sm self-start sm:self-auto"
                              >
                                {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                Complete Order
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Communication */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Communication
                      </h3>
                      {((isOrderSeller && order.buyer_id) || (isOrderBuyer && order.seller_id)) && (
                        <Link
                          to={`/messages?userId=${isOrderSeller ? order.buyer_id : order.seller_id}&name=${encodeURIComponent((isOrderSeller ? order.buyer_name : order.seller_name) || 'User')}`}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Open Full Chat
                        </Link>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder={`Send a direct message to ${isOrderSeller ? (order.buyer_name || 'the buyer') : (order.seller_name || 'the seller')}...`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !message.trim()}
                      className="mt-3 w-full"
                    >
                      {sendingMessage ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Message
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Price Negotiation (Seller only) */}
              {isOrderSeller && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Price Negotiation
                      </h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Price</span>
                        <span className="text-2xl font-bold text-primary">LKR {order.amount.toLocaleString()}</span>
                      </div>

                      {order.proposal_status === 'pending' && order.proposed_price ? (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider block">
                                Pending Proposal
                              </span>
                              <span className="text-xl font-bold text-foreground">
                                LKR {order.proposed_price.toLocaleString()}
                              </span>
                            </div>
                            <Badge variant="warning" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40">
                              Awaiting Buyer Approval
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            You proposed a revised price of LKR {order.proposed_price.toLocaleString()}. The order price will automatically update once the buyer approves.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelProposal}
                            disabled={cancelling}
                            className="text-xs h-8 text-destructive hover:bg-destructive/10 border-destructive/30"
                          >
                            {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                            Cancel Proposal
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {order.proposal_status === 'rejected' && (
                            <p className="text-xs text-destructive font-medium">
                              Your previous price proposal was declined by the buyer. You can propose a different price below.
                            </p>
                          )}
                          <label className="block text-sm font-semibold">Propose New Price</label>
                          <div className="flex gap-3">
                            <div className="relative flex-1">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                                LKR
                              </span>
                              <input
                                type="number"
                                min="1"
                                step="any"
                                placeholder="Enter amount"
                                value={proposedPrice}
                                onChange={(e) => setProposedPrice(e.target.value)}
                                className="w-full pl-14 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                            </div>
                            <Button
                              onClick={handleProposePrice}
                              disabled={proposing || !proposedPrice.trim()}
                            >
                              {proposing ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                              Propose
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">Note: Price changes require buyer approval</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Order Details</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Service</p>
                      <p className="font-semibold">{order.service_name}</p>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground mb-1">Buyer</p>
                      <p className="font-semibold">{order.buyer_name || `Buyer #${order.buyer_id}`}</p>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground mb-1">Seller</p>
                      <p className="font-semibold">{order.seller_name || `Seller #${order.seller_id}`}</p>
                    </div>
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <div className="text-right">
                          <span className="font-bold text-primary">LKR {order.amount.toLocaleString()}</span>
                          {order.proposal_status === 'pending' && order.proposed_price && (
                            <span className="block text-xs text-amber-600 dark:text-amber-400 font-medium">
                              (Prop: LKR {order.proposed_price.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={
                          order.status === 'completed' ? 'success' :
                            order.status === 'in-progress' ? 'info' : 'warning'
                        }>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Order Actions for Seller */}
              {isOrderSeller && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                  <Card className="border-primary/30 bg-primary/5">
                    <CardHeader className="pb-3">
                      <h3 className="text-base font-semibold">Order Management</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {order.status === 'pending' && (
                        <>
                          <p className="text-xs text-muted-foreground">
                            Ready to start? Mark this order as In Progress to update the buyer dashboard and show it as an active order.
                          </p>
                          <Button
                            onClick={() => handleUpdateStatus('in-progress')}
                            disabled={updatingStatus}
                            className="w-full gap-2 bg-[#0089BA] hover:bg-[#00739c] text-white font-medium"
                          >
                            {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                            Mark as In Progress
                          </Button>
                        </>
                      )}
                      {order.status === 'in-progress' && (
                        <>
                          <p className="text-xs text-muted-foreground">
                            Work is underway. When you have finished the work, click below to mark it completed.
                          </p>
                          <Button
                            onClick={() => handleUpdateStatus('completed')}
                            disabled={updatingStatus}
                            className="w-full gap-2 bg-[#00D084] hover:bg-[#00b572] text-white font-medium"
                          >
                            {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Mark as Completed
                          </Button>
                        </>
                      )}
                      {order.status === 'completed' && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle className="w-4 h-4" />
                          This order has been completed.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Files
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* ── Review Modal ── */}
          {showReviewModal && (
            <ReviewModal
              isOpen={showReviewModal}
              onClose={() => setShowReviewModal(false)}
              orderId={order.id}
              orderService={order.service_name}
              sellerName={order.seller_name || `Seller #${order.seller_id}`}
              onSuccess={handleReviewSuccess}
            />
          )}
        </>
      )}
    </div>
  );
}