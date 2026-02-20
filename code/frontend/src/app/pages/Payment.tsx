import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

interface LocationState {
  service?: string;
  packageName?: string;
  price?: number;
}

const PLATFORM_FEE_PCT = 0.05;

export function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};

  // Use order data passed via router state when available; fallback to sensible defaults
  const serviceName = state.service ?? 'Professional Logo Design';
  const packageName = state.packageName ?? 'Standard';
  const price = state.price ?? 750;
  const platformFee = parseFloat((price * PLATFORM_FEE_PCT).toFixed(2));
  const total = parseFloat((price + platformFee).toFixed(2));

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = (e: React.FormEvent | React.MouseEvent) => {
    // Works for both FormEvent (card) and MouseEvent (PayPal button)
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);

      setTimeout(() => {
        navigate('/payment/success');
      }, 1500);
    }, 2000);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">Redirecting to receipt...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your payment securely</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'card'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <CreditCard className="w-6 h-6 mb-2" />
                    <div className="font-semibold">Credit/Debit Card</div>
                    <div className="text-sm text-muted-foreground">Visa, Mastercard, Amex</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'paypal'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <div className="w-6 h-6 mb-2 font-bold text-primary">P</div>
                    <div className="font-semibold">PayPal</div>
                    <div className="text-sm text-muted-foreground">Fast &amp; secure</div>
                  </button>
                </div>

                {/* Card Details Form */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handlePayment} className="space-y-4">
                    <Input
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        label="Expiry Month"
                        placeholder="MM"
                        required
                      />
                      <Input
                        label="Expiry Year"
                        placeholder="YY"
                        required
                      />
                      <Input
                        label="CVV"
                        placeholder="123"
                        required
                      />
                    </div>
                    <Input
                      label="Cardholder Name"
                      placeholder="John Doe"
                      required
                    />

                    <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
                      <Lock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        Your payment information is encrypted and secure. We never store your card details.
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : `Pay $${total}`}
                    </Button>
                  </form>
                )}

                {/* PayPal Flow — Fixed: uses onClick with MouseEvent, no form needed */}
                {paymentMethod === 'paypal' && (
                  <div className="text-center py-8">
                    <Button
                      onClick={handlePayment}
                      className="w-full max-w-md"
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : `Continue with PayPal — $${total}`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <h3 className="text-lg font-semibold">Order Summary</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">{serviceName}</h4>
                  <Badge variant="info">{packageName} Package</Badge>
                </div>

                <div className="space-y-3 py-4 border-y border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Price</span>
                    <span className="font-semibold">${price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (5%)</span>
                    <span className="font-semibold">${platformFee}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">${total}</span>
                </div>

                <div className="bg-accent/50 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    <CheckCircle className="w-4 h-4 text-accent-foreground" />
                    Money-Back Guarantee
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Your payment is protected. Get a full refund if you're not satisfied.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
