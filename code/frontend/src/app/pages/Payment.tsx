import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { CreditCard, Lock, CheckCircle, Building2, QrCode, Upload, FileCheck, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

import { useTranslation } from 'react-i18next';

interface LocationState {
  service?: string;
  packageName?: string;
  price?: number;
}

const PLATFORM_FEE_PCT = 0.05;

export function Payment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};

  // Use order data passed via router state when available; fallback to sensible defaults
  const serviceName = state.service ?? '';
  const packageName = state.packageName ?? '';
  const price = state.price ?? 0;
  const platformFee = parseFloat((price * PLATFORM_FEE_PCT).toFixed(2));
  const total = parseFloat((price + platformFee).toFixed(2));

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipError, setSlipError] = useState<string | null>(null);

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      setSlipError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePayment = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (paymentMethod === 'bank_transfer' && !slipFile) {
      setSlipError(t('payment.slip_required'));
      return;
    }

    const transaction = {
      id: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toLocaleString(),
      service: serviceName,
      package: packageName,
      seller: 'Unknown',
      amount: total,
      paymentMethod: paymentMethod,
      slipUrl: slipPreview,
    };
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);

      setTimeout(() => {
        navigate('/payment/success', { state: { transaction } });
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
          <h1 className="text-3xl font-bold mb-2">{t('payment.success')}</h1>
          <p className="text-muted-foreground">{t('payment.redirecting')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('payment.checkout')}</h1>
        <p className="text-muted-foreground">{t('payment.complete_payment')}</p>
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
                <h2 className="text-xl font-semibold">{t('payment.payment_method')}</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${paymentMethod === 'card'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <CreditCard className="w-6 h-6 mb-2 text-primary" />
                    <div className="font-semibold text-sm">{t('payment.credit_debit')}</div>
                    <div className="text-xs text-muted-foreground">{t('payment.card_desc')}</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${paymentMethod === 'paypal'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <div className="w-6 h-6 mb-2 font-bold text-primary text-xl">P</div>
                    <div className="font-semibold text-sm">{t('payment.paypal')}</div>
                    <div className="text-xs text-muted-foreground">{t('payment.paypal_desc')}</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <QrCode className="w-5 h-5 text-accent" />
                    </div>
                    <div className="font-semibold text-sm">{t('payment.bank_transfer')}</div>
                    <div className="text-xs text-muted-foreground">{t('payment.bank_desc')}</div>
                  </button>
                </div>

                {/* Card Details Form */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handlePayment} className="space-y-4">
                    <Input
                      label={t('payment.card_number')}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        label={t('payment.expiry_month')}
                        placeholder="MM"
                        required
                      />
                      <Input
                        label={t('payment.expiry_year')}
                        placeholder="YY"
                        required
                      />
                      <Input
                        label={t('payment.cvv')}
                        placeholder="123"
                        required
                      />
                    </div>
                    <Input
                      label={t('payment.cardholder')}
                      placeholder="Shehani Cooray"
                      required
                    />

                    <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
                      <Lock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        {t('payment.encryption_notice')}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={processing}
                    >
                      {processing ? t('payment.processing') : `${t('payment.pay')} $${total}`}
                    </Button>
                  </form>
                )}

                {/* PayPal Flow */}
                {paymentMethod === 'paypal' && (
                  <div className="text-center py-8">
                    <Button
                      onClick={handlePayment}
                      className="w-full max-w-md"
                      disabled={processing}
                    >
                      {processing ? t('payment.processing') : `${t('payment.continue_paypal')} $${total}`}
                    </Button>
                  </div>
                )}

                {/* Bank Transfer & LankaQR Flow */}
                {paymentMethod === 'bank_transfer' && (
                  <form onSubmit={handlePayment} className="space-y-6">
                    {/* Bank Details & LankaQR Container */}
                    <div className="grid md:grid-cols-2 gap-6 bg-muted/30 p-5 rounded-xl border border-border">
                      {/* Bank Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 font-semibold text-base border-b border-border pb-2">
                          <Building2 className="w-5 h-5 text-primary" />
                          {t('payment.bank_details_title')}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-xs text-muted-foreground block">{t('payment.bank_name')}</span>
                            <span className="font-medium">{t('payment.bank_name_val')}</span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">{t('payment.account_name')}</span>
                            <span className="font-medium">{t('payment.account_name_val')}</span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">{t('payment.account_number')}</span>
                            <span className="font-mono font-semibold text-primary">{t('payment.account_number_val')}</span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">{t('payment.branch')}</span>
                            <span className="font-medium">{t('payment.branch_val')}</span>
                          </div>
                        </div>
                      </div>

                      {/* LankaQR Code */}
                      <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg border border-border text-center">
                        <div className="flex items-center gap-1.5 font-semibold text-sm mb-2 text-primary">
                          <QrCode className="w-4 h-4 text-accent" />
                          {t('payment.lankaqr_title')}
                        </div>
                        {/* Sample LankaQR graphic */}
                        <div className="w-32 h-32 bg-white p-2 rounded-lg border border-border shadow-sm flex items-center justify-center mb-2 relative">
                          <div className="w-full h-full bg-slate-900 rounded p-1.5 flex flex-col justify-between">
                            <div className="flex justify-between">
                              <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
                              <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
                            </div>
                            <div className="text-[10px] font-bold text-center text-amber-400 tracking-wider">LANKAQR</div>
                            <div className="flex justify-between">
                              <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
                              <div className="w-3 h-3 bg-white rounded-xs"></div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground max-w-[200px]">
                          {t('payment.lankaqr_desc')}
                        </p>
                      </div>
                    </div>

                    {/* Receipt Slip Upload Dropzone */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Upload className="w-4 h-4 text-primary" />
                        {t('payment.upload_slip_title')}
                      </label>

                      {slipPreview ? (
                        <div className="flex items-center justify-between p-4 border border-green-500/30 bg-green-500/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <img src={slipPreview} alt="Receipt preview" className="w-12 h-12 rounded-lg object-cover border border-border" />
                            <div>
                              <div className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
                                <FileCheck className="w-4 h-4" />
                                {t('payment.slip_uploaded')}
                              </div>
                              <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                                {slipFile?.name}
                              </p>
                            </div>
                          </div>
                          <label className="cursor-pointer text-xs font-medium px-3 py-1.5 bg-background border border-border rounded-lg hover:bg-accent transition">
                            {t('payment.change_slip')}
                            <input type="file" accept="image/*" className="hidden" onChange={handleSlipChange} />
                          </label>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/60 hover:bg-muted/30 transition text-center">
                          <Upload className="w-8 h-8 text-muted-foreground opacity-60 mb-2" />
                          <p className="text-sm font-medium">{t('payment.upload_slip_title')}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t('payment.upload_slip_desc')}</p>
                          <input type="file" accept="image/*" className="hidden" onChange={handleSlipChange} />
                        </label>
                      )}

                      {slipError && (
                        <div className="flex items-center gap-1.5 text-xs text-destructive mt-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {slipError}
                        </div>
                      )}
                    </div>

                    {/* Notice */}
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-700 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{t('payment.verification_notice')}</span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={processing}
                    >
                      {processing ? t('payment.processing') : `${t('payment.submit_bank_payment')} $${total}`}
                    </Button>
                  </form>
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
                <h3 className="text-lg font-semibold">{t('payment.order_summary')}</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">{serviceName || t('payment.no_service')}</h4>
                  {packageName && <Badge variant="info">{packageName} {t('payment.package')}</Badge>}
                </div>

                <div className="space-y-3 py-4 border-y border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('payment.service_price')}</span>
                    <span className="font-semibold">${price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('payment.platform_fee')}</span>
                    <span className="font-semibold">${platformFee}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">{t('payment.total')}</span>
                  <span className="text-2xl font-bold text-primary">${total}</span>
                </div>

                <div className="bg-accent/50 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    <CheckCircle className="w-4 h-4 text-accent-foreground" />
                    {t('payment.money_back')}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {t('payment.protection_notice')}
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
