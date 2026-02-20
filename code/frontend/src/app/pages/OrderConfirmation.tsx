import React from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function OrderConfirmation() {
  const navigate = useNavigate();

  const orderDetails = {
    orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    service: 'Professional Logo Design',
    package: 'Standard',
    seller: 'Design Studio Pro',
    price: 750,
    platformFee: 37.5,
    total: 787.5,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">Your order has been placed successfully</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <Badge variant="success">Confirmed</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                <p className="font-semibold">{orderDetails.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Service</p>
                <p className="font-semibold">{orderDetails.service}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Package</p>
                <p className="font-semibold">{orderDetails.package}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Seller</p>
                <p className="font-semibold">{orderDetails.seller}</p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4">Cost Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Price</span>
                  <span className="font-semibold">${orderDetails.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (5%)</span>
                  <span className="font-semibold">${orderDetails.platformFee}</span>
                </div>
                <div className="flex justify-between text-lg pt-3 border-t border-border">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">${orderDetails.total}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  What's Next?
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                  <li>• The seller will be notified of your order</li>
                  <li>• You'll receive a message to discuss requirements</li>
                  <li>• Payment will be held securely until completion</li>
                  <li>• Track your order status in your dashboard</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/payment" className="flex-1">
                <Button className="w-full">
                  Proceed to Payment <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/messages" className="flex-1">
                <Button variant="outline" className="w-full">
                  Contact Seller
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Link to="/dashboard" className="text-primary hover:underline">
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
