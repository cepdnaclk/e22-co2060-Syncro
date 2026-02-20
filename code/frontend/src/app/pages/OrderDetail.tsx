import React, { useState } from 'react';
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
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { ReviewModal } from '../components/ReviewModal';
import { useApp } from '../context/AppContext';

export function OrderDetail() {
  const { id } = useParams();
  const { role, businessProfile, setBusinessProfile } = useApp();
  const [message, setMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const order = {
    id: 'ORD-A1B2C3D4',
    service: 'Professional Logo Design',
    package: 'Standard',
    status: 'completed', // Changed to completed to show review button
    buyer: 'Tech Startup Ltd',
    seller: 'Design Studio Pro',
    sellerId: 'seller-1',
    createdAt: '2026-02-15',
    deadline: '2026-02-20',
    amount: 750,
    platformFee: 37.5,
    total: 787.5,
    notes: 'Looking for a modern, minimalist logo that represents innovation and technology.',
    hasReview: false,
    timeline: [
      { status: 'placed', label: 'Order Placed', date: '2026-02-15 10:30 AM', completed: true },
      { status: 'confirmed', label: 'Order Confirmed', date: '2026-02-15 10:35 AM', completed: true },
      { status: 'in-progress', label: 'In Progress', date: '2026-02-15 2:00 PM', completed: true },
      { status: 'review', label: 'Under Review', date: '2026-02-18 4:00 PM', completed: true },
      { status: 'completed', label: 'Completed', date: '2026-02-19 11:00 AM', completed: true },
    ],
  };

  const messages = [
    { id: 1, sender: 'seller', text: 'Hi! Thanks for your order. I\'ve reviewed your requirements and will start working on concepts.', time: '10:40 AM' },
    { id: 2, sender: 'buyer', text: 'Great! Looking forward to seeing your designs.', time: '11:05 AM' },
    { id: 3, sender: 'seller', text: 'I have 3 initial concepts ready. Would you like me to share them now?', time: '2:15 PM' },
  ];

  const handleSubmitReview = (rating: number, comment: string) => {
    // In production, this would submit to API
    console.log('Review submitted:', { rating, comment, orderId: order.id });
    
    // Update business profile with new review
    if (businessProfile) {
      const newReview = {
        id: `review-${Date.now()}`,
        rating,
        comment,
        buyerName: 'Alex Rivera',
        buyerInitials: 'AR',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        orderId: order.id,
      };

      const updatedReviews = [...(businessProfile.reviews || []), newReview];
      const newRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;

      setBusinessProfile({
        ...businessProfile,
        reviews: updatedReviews,
        rating: newRating,
        reviewCount: updatedReviews.length,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <p className="text-muted-foreground">Placed on {order.createdAt}</p>
          </div>
        </div>
        <Badge variant={
          order.status === 'completed' ? 'success' :
          order.status === 'in-progress' ? 'info' : 'warning'
        }>
          {order.status.replace('-', ' ')}
        </Badge>
      </div>

      {/* Review Button for Buyer (if completed and no review) */}
      {role === 'buyer' && order.status === 'completed' && !order.hasReview && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">How was your experience?</h3>
                    <p className="text-sm text-muted-foreground">Share your feedback to help others</p>
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Order Timeline</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {order.timeline.map((item, index) => (
                    <div key={item.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        {index < order.timeline.length - 1 && (
                          <div className={`w-0.5 h-12 ${item.completed ? 'bg-primary' : 'bg-muted'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <h4 className="font-semibold mb-1">{item.label}</h4>
                        {item.date && (
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat/Communication */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Communication
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${msg.sender === 'buyer' ? 'order-2' : 'order-1'}`}>
                        <div className={`p-3 rounded-lg ${
                          msg.sender === 'buyer' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-2">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

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

          {/* Price Negotiation (Seller View) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Price Negotiation
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Current Price</span>
                    <span className="text-2xl font-bold text-primary">${order.amount}</span>
                  </div>
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
                  <p className="text-xs text-muted-foreground">
                    Note: Price changes require buyer approval
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Order Details</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Service</p>
                  <p className="font-semibold">{order.service}</p>
                  <Badge variant="info" className="mt-1">{order.package} Package</Badge>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-1">Buyer</p>
                  <p className="font-semibold">{order.buyer}</p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-1">Deadline</p>
                  <p className="font-semibold">{order.deadline}</p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Order Notes</p>
                  <p className="text-sm">{order.notes}</p>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Price</span>
                    <span className="font-semibold">${order.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="font-semibold">${order.platformFee}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">${order.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Files
                </Button>
                <Button variant="outline" className="w-full">
                  View Invoice
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          orderService={order.service}
          sellerName={order.seller}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
}