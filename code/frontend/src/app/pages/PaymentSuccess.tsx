import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle, Download, MessageSquare, Home } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function PaymentSuccess() {
  const transaction = {
    id: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    date: new Date().toLocaleString(),
    service: 'Professional Logo Design',
    package: 'Standard',
    seller: 'Design Studio Pro',
    amount: 787.5,
    paymentMethod: 'Visa •••• 4242',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Success Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-16 h-16 text-green-500" />
        </motion.div>
        <h1 className="text-4xl font-bold mb-3">Payment Successful!</h1>
        <p className="text-xl text-muted-foreground mb-2">
          Your order has been confirmed and payment processed
        </p>
        <Badge variant="success" className="text-sm py-1 px-3">
          Transaction ID: {transaction.id}
        </Badge>
      </motion.div>

      {/* Transaction Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="text-center pb-6 border-b border-border">
              <h2 className="text-2xl font-bold mb-2">Receipt</h2>
              <p className="text-sm text-muted-foreground">{transaction.date}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                <p className="font-semibold">{transaction.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Service</p>
                <p className="font-semibold">{transaction.service}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Package</p>
                <p className="font-semibold">{transaction.package}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Seller</p>
                <p className="font-semibold">{transaction.seller}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                <p className="font-semibold">{transaction.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-primary">${transaction.amount}</p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                What Happens Next?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  <span>The seller has been notified and will start working on your order</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  <span>You'll receive a message to discuss project details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  <span>Track your order progress in your dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">4.</span>
                  <span>Leave a review once the order is completed</span>
                </li>
              </ul>
            </div>

            <div className="grid md:grid-cols-3 gap-3 pt-6 border-t border-border">
              <Link to="/dashboard" className="md:col-span-1">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/messages" className="md:col-span-1">
                <Button variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
              </Link>
              <Button className="w-full md:col-span-1">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-muted/50 rounded-lg p-6"
      >
        <h3 className="font-semibold mb-3">Need Help?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          If you have any questions about your order or payment, our support team is here to help.
        </p>
        <Link to="/support">
          <Button variant="outline" size="sm">Contact Support</Button>
        </Link>
      </motion.div>
    </div>
  );
}
