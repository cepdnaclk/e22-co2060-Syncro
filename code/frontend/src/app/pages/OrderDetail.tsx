import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { ReviewModal } from '../components/ReviewModal';
import { useApp } from '../context/AppContext';
import { ordersApi, Order } from '../services/api';

export function OrderDetail() {
  const { id } = useParams();
  const { role, authUser } = useApp();
  const [message, setMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ordersApi.getForUser(authUser?.userId ?? 0)
      .then((orders) => {
        const found = orders.find((o) => o.id === Number(id)) ?? null;
        setOrder(found);
        if (!found) setError('Order not found or you do not have access to it.');
      })
      .catch((e: any) => setError(e.message || 'Failed to load order.'))
      .finally(() => setLoading(false));
  }, [id, authUser?.userId]);

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
            <Badge variant={
              order.status === 'completed' ? 'success' :
                order.status === 'in-progress' ? 'info' : 'warning'
            }>
              {order.status.replace('-', ' ')}
            </Badge>
          </div>

          {/* ── Review prompt (buyer only, completed order, not yet reviewed) ── */}
          {role === 'buyer' && order.buyer_id === authUser?.userId && order.status === 'completed' && !order.has_review && (
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
          {role === 'buyer' && order.buyer_id === authUser?.userId && order.status === 'completed' && order.has_review && (
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
                          <div className="flex-1 pb-6">
                            <h4 className="font-semibold mb-1">{item.label}</h4>
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
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Communication
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                    />
                    <Button className="mt-3 w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Price Negotiation (Seller only) */}
              {role === 'seller' && (
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
                        <span className="text-2xl font-bold text-primary">LKR {order.amount}</span>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold">Propose New Price</label>
                        <div className="flex gap-3">
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={proposedPrice}
                            onChange={(e) => setProposedPrice(e.target.value)}
                            className="flex-1 px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <Button>Propose</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Note: Price changes require buyer approval</p>
                      </div>
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
                        <span className="font-bold text-primary">LKR {order.amount}</span>
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