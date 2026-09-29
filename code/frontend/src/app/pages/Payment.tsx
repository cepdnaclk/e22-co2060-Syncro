import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { motion } from 'motion/react';
import {
  CreditCard,
  Lock,
  CheckCircle,
  Building2,
  QrCode,
  Upload,
  FileCheck,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Clock,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { ordersApi, Order } from '../services/api';
import { toast } from 'sonner';

interface LocationState {
  service?: string;
  packageName?: string;
  price?: number;
  orderId?: number | string;
  sellerName?: string;
}

const PLATFORM_FEE_PCT = 0.05;

export function Payment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};

  // Extract orderId from URL query param (?orderId=123) or router state
  const searchParams = new URLSearchParams(location.search);
  const queryOrderIdStr = searchParams.get('orderId');
  const targetOrderId = queryOrderIdStr
    ? parseInt(queryOrderIdStr, 10)
    : state.orderId
    ? Number(state.orderId)
    : null;

  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState<boolean>(Boolean(targetOrderId && !isNaN(targetOrderId)));
  const [copiedRef, setCopiedRef] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipError, setSlipError] = useState<string | null>(null);

  useEffect(() => {
    if (targetOrderId && !isNaN(targetOrderId)) {
      setLoadingOrder(true);
      ordersApi
        .getById(targetOrderId)
        .then((data) => {
          setOrder(data);
          if (data.payment_slip_url) {
            setSlipPreview(data.payment_slip_url);
          }
        })
        .catch((err) => {
          console.error('Failed to load order for payment:', err);
          toast.error(`Could not load details for Order #${targetOrderId}`);
        })
        .finally(() => setLoadingOrder(false));
    }
  }, [targetOrderId]);

  // Derived order details
  const effectiveOrderId = order ? order.id : targetOrderId && !isNaN(targetOrderId) ? targetOrderId : null;
  const serviceName = order ? order.service_name : state.service ?? '';
  const packageName = state.packageName ?? '';
  const sellerName = order?.seller_name || state.sellerName || 'Seller';

  // Total pricing logic
  const total = order
    ? order.amount
    : parseFloat(((state.price ?? 0) * (1 + PLATFORM_FEE_PCT)).toFixed(2));
  const price = order
    ? parseFloat((order.amount / (1 + PLATFORM_FEE_PCT)).toFixed(2))
    : state.price ?? 0;
  const platformFee = parseFloat((total - price).toFixed(2));

  const handleCopyReference = () => {
    const refCode = effectiveOrderId ? `#${effectiveOrderId}` : 'SYNCRO-ORDER';
    navigator.clipboard.writeText(refCode);
    setCopiedRef(true);
    toast.success(`Copied reference "${refCode}" to clipboard!`);
    setTimeout(() => setCopiedRef(false), 2500);
  };

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

  const handlePayment = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (paymentMethod === 'bank_transfer' && !slipPreview) {
      setSlipError(t('payment.slip_required'));
      return;
    }

    setProcessing(true);
    setSlipError(null);

    try {
      if (effectiveOrderId) {
        // Submit slip for the specific order in database and update Admin Portal queue
        const updated = await ordersApi.submitSlip(effectiveOrderId, slipPreview || '', paymentMethod);
        setOrder(updated);
        toast.success(`Payment slip submitted for Order #${effectiveOrderId}! Admin has been notified.`);
      }

      const transaction = {
        id: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        orderId: effectiveOrderId ? `#${effectiveOrderId}` : 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        rawOrderId: effectiveOrderId,
        date: new Date().toLocaleString(),
        service: serviceName,
        package: packageName,
        seller: sellerName,
        amount: total,
        paymentMethod: paymentMethod,
        slipUrl: slipPreview,
      };

      setSuccess(true);
      setTimeout(() => {
        navigate('/payment/success', { state: { transaction } });
      }, 1500);
    } catch (err: any) {
      console.error('Payment slip submission error:', err);
      setSlipError(err.message || 'Failed to submit payment slip. Please try again.');
      toast.error(err.message || 'Payment submission failed.');
      setProcessing(false);
    }
  };

  if (loadingOrder) {
    return (
      <div className="max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading Order #{targetOrderId} details...</p>
      </div>
    );
  }

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
      {/* Header with Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {effectiveOrderId ? (
              <Link
                to={`/order/${effectiveOrderId}`}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Order #{effectiveOrderId}
              </Link>
            ) : (
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {effectiveOrderId ? `Pay for Order #${effectiveOrderId}` : t('payment.checkout')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {effectiveOrderId
              ? `Complete payment for "${serviceName}" to release this order to the seller.`
              : t('payment.complete_payment')}
          </p>
        </div>

        {effectiveOrderId && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 bg-card">
              Order #{effectiveOrderId}
            </Badge>
            {order?.payment_verified ? (
              <Badge variant="success" className="gap-1 text-xs">
                <ShieldCheck className="w-3 h-3" /> Paid & Verified
              </Badge>
            ) : order?.payment_slip_url ? (
              <Badge variant="warning" className="gap-1 text-xs bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                <Clock className="w-3 h-3" /> Slip Under Review
              </Badge>
            ) : (
              <Badge variant="warning" className="gap-1 text-xs">
                Pending Payment
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Already verified banner */}
      {order?.payment_verified && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-200">
                  Payment Already Verified in Escrow!
                </h3>
                <p className="text-xs text-muted-foreground">
                  The payment slip for Order #{effectiveOrderId} has already been verified and approved by the platform administrator.
                </p>
              </div>
            </div>
            <Link to={`/order/${effectiveOrderId}`}>
              <Button size="sm" className="whitespace-nowrap">
                Go to Order #{effectiveOrderId}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ── CRITICAL REFERENCE WARNING BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/10 border-2 border-amber-500/50 rounded-2xl p-5 shadow-sm space-y-3.5"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-extrabold text-base text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                CRITICAL WARNING: Add Order Number as Payment Reference
              </h3>
              {effectiveOrderId && (
                <Badge variant="warning" className="bg-amber-500/25 text-amber-900 dark:text-amber-100 border-amber-500/40 font-mono text-xs font-bold px-2 py-0.5">
                  Reference: #{effectiveOrderId}
                </Badge>
              )}
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed font-normal">
              When making your bank transfer or scanning the LankaQR code, you <strong className="text-amber-700 dark:text-amber-300 font-bold underline">MUST</strong> enter your Order Number <strong className="font-mono text-base font-bold bg-amber-500/20 px-2 py-0.5 rounded text-primary">#{effectiveOrderId || 'ORDER_ID'}</strong> as the <span className="font-semibold underline">payment description / remarks / reference</span>.
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Platform administrators verify payment slips in the Admin Portal by matching this reference code to your specific Order Number. Slips submitted without the Order Number cannot be verified automatically.
            </p>
          </div>
        </div>

        {effectiveOrderId && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card border border-amber-500/30 rounded-xl shadow-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs text-muted-foreground font-semibold">Your Exact Payment Reference:</span>
              <code className="text-sm font-bold font-mono text-primary bg-primary/10 px-3 py-1 rounded-md border border-primary/20">
                #{effectiveOrderId}
              </code>
              <span className="text-[11px] text-muted-foreground italic">(Copy and paste in bank remarks)</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyReference}
              className="h-8 text-xs font-semibold gap-1.5 border-primary/40 text-primary hover:bg-primary/10 shadow-sm shrink-0"
            >
              {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedRef ? 'Copied Reference!' : 'Copy Reference Code'}
            </Button>
          </div>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">{t('payment.payment_method')}</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Bank Transfer (Priority / Active) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-4 border-2 rounded-lg transition-all text-left relative ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-5 h-5 text-primary" />
                        <QrCode className="w-5 h-5 text-accent" />
                      </div>
                      <Badge variant="success" className="text-[10px] uppercase font-bold px-1.5 py-0.5">
                        Active
                      </Badge>
                    </div>
                    <div className="font-semibold text-sm">{t('payment.bank_transfer')}</div>
                    <div className="text-xs text-muted-foreground">{t('payment.bank_desc')}</div>
                  </button>

                  {/* Credit/Debit Card (Coming Soon) */}
                  <div className="p-4 border-2 border-border/60 rounded-lg text-left opacity-60 bg-muted/20 relative cursor-not-allowed select-none">
                    <div className="flex items-center justify-between mb-2">
                      <CreditCard className="w-6 h-6 text-muted-foreground" />
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium bg-muted text-muted-foreground border-border px-1.5 py-0.5"
                      >
                        {t('payment.coming_soon')}
                      </Badge>
                    </div>
                    <div className="font-semibold text-sm text-muted-foreground">{t('payment.credit_debit')}</div>
                    <div className="text-xs text-muted-foreground/70">{t('payment.card_desc')}</div>
                  </div>

                  {/* PayPal (Coming Soon) */}
                  <div className="p-4 border-2 border-border/60 rounded-lg text-left opacity-60 bg-muted/20 relative cursor-not-allowed select-none">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-6 h-6 font-bold text-muted-foreground text-xl">P</div>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium bg-muted text-muted-foreground border-border px-1.5 py-0.5"
                      >
                        {t('payment.coming_soon')}
                      </Badge>
                    </div>
                    <div className="font-semibold text-sm text-muted-foreground">{t('payment.paypal')}</div>
                    <div className="text-xs text-muted-foreground/70">{t('payment.paypal_desc')}</div>
                  </div>
                </div>

                {/* Card Details Form (Fallback) */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handlePayment} className="space-y-4">
                    <Input label={t('payment.card_number')} placeholder="1234 5678 9012 3456" required />
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input label={t('payment.expiry_month')} placeholder="MM" required />
                      <Input label={t('payment.expiry_year')} placeholder="YY" required />
                      <Input label={t('payment.cvv')} placeholder="123" required />
                    </div>
                    <Input label={t('payment.cardholder')} placeholder="Your Name" required />

                    <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
                      <Lock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-muted-foreground">{t('payment.encryption_notice')}</div>
                    </div>

                    <Button type="submit" className="w-full" disabled={processing}>
                      {processing ? t('payment.processing') : `${t('payment.pay')} LKR ${total.toLocaleString()}`}
                    </Button>
                  </form>
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

                          {/* Dedicated Reference Box */}
                          <div className="pt-2 border-t border-border">
                            <div className="bg-primary/10 border border-primary/30 rounded-lg p-2.5 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-primary font-bold uppercase tracking-wider">
                                  Transaction Reference
                                </span>
                                {effectiveOrderId && (
                                  <button
                                    type="button"
                                    onClick={handleCopyReference}
                                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                                  >
                                    {copiedRef ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedRef ? 'Copied' : 'Copy'}
                                  </button>
                                )}
                              </div>
                              <div className="font-mono font-bold text-base text-primary">
                                #{effectiveOrderId || 'PENDING'}
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-tight">
                                Enter <strong>#{effectiveOrderId || 'PENDING'}</strong> in your bank app remarks so admin can verify this order immediately.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LankaQR Code */}
                      <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg border border-border text-center">
                        <div className="flex items-center gap-1.5 font-semibold text-sm mb-2 text-primary">
                          <QrCode className="w-4 h-4 text-accent" />
                          {t('payment.lankaqr_title')}
                        </div>
                        <div className="w-36 h-36 bg-white p-1.5 rounded-lg border border-border shadow-sm flex items-center justify-center mb-2">
                          <img
                            src="/images/lankaqr.jpg"
                            alt="LankaQR Code"
                            className="w-full h-full object-contain rounded"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                          {t('payment.lankaqr_desc')}
                        </p>
                        {effectiveOrderId && (
                          <div className="mt-2 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                            Reference: #{effectiveOrderId}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Receipt Slip Upload Dropzone */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                          <Upload className="w-4 h-4 text-primary" />
                          {t('payment.upload_slip_title')}
                        </label>
                        {order?.payment_slip_url && (
                          <span className="text-xs text-amber-600 font-medium">
                            Slip currently attached
                          </span>
                        )}
                      </div>

                      {slipPreview ? (
                        <div className="flex items-center justify-between p-4 border border-green-500/30 bg-green-500/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <img
                              src={slipPreview}
                              alt="Receipt preview"
                              className="w-14 h-14 rounded-lg object-cover border border-border shadow-xs"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
                                <FileCheck className="w-4 h-4" />
                                {t('payment.slip_uploaded')}
                              </div>
                              <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                                {slipFile ? slipFile.name : `Order #${effectiveOrderId} Slip`}
                              </p>
                              <a
                                href={slipPreview}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                <ExternalLink className="w-3 h-3" /> View full slip image
                              </a>
                            </div>
                          </div>
                          <label className="cursor-pointer text-xs font-medium px-3 py-1.5 bg-background border border-border rounded-lg hover:bg-accent transition shadow-xs">
                            {t('payment.change_slip')}
                            <input type="file" accept="image/*" className="hidden" onChange={handleSlipChange} />
                          </label>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/60 hover:bg-muted/30 transition text-center">
                          <Upload className="w-8 h-8 text-muted-foreground opacity-60 mb-2" />
                          <p className="text-sm font-medium">{t('payment.upload_slip_title')}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t('payment.upload_slip_desc')}</p>
                          <span className="text-[11px] text-primary font-medium mt-2">
                            Supports JPG, PNG, WEBP (Max 5MB)
                          </span>
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
                      <div>
                        <span className="font-semibold block mb-0.5">Verification Process:</span>
                        <span>
                          Once submitted, your receipt slip will be updated in the Admin Portal for Order #{effectiveOrderId || '...'}. Our team confirms the bank transfer reference and activates the order for the seller.
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold shadow-sm"
                      disabled={processing || Boolean(order?.payment_verified)}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Submitting Slip for Order #{effectiveOrderId}...
                        </>
                      ) : (
                        `${effectiveOrderId ? `Submit Slip for Order #${effectiveOrderId}` : t('payment.submit_bank_payment')} — LKR ${total.toLocaleString()}`
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('payment.order_summary')}</h3>
                  {effectiveOrderId && (
                    <Badge variant="outline" className="font-mono text-xs">
                      #{effectiveOrderId}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1 text-foreground line-clamp-2">
                    {serviceName || t('payment.no_service')}
                  </h4>
                  {sellerName && (
                    <p className="text-xs text-muted-foreground">
                      Seller: <span className="font-medium text-foreground">{sellerName}</span>
                    </p>
                  )}
                  {packageName && <Badge variant="info" className="mt-1">{packageName} {t('payment.package')}</Badge>}
                </div>

                <div className="space-y-3 py-4 border-y border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('payment.service_price')}</span>
                    <span className="font-semibold">LKR {price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('payment.platform_fee')}</span>
                    <span className="font-semibold">LKR {platformFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">{t('payment.total')}</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">LKR {total.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground block">Includes Syncro Escrow Protection</span>
                  </div>
                </div>

                {effectiveOrderId && (
                  <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Ref:</span>
                      <span className="font-mono font-bold text-primary">#{effectiveOrderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="capitalize font-medium text-foreground">{order?.status || 'Pending Payment'}</span>
                    </div>
                  </div>
                )}

                <div className="bg-accent/50 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2 font-semibold mb-1.5">
                    <CheckCircle className="w-4 h-4 text-accent-foreground" />
                    {t('payment.money_back')}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
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
