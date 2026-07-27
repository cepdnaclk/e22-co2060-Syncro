import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowLeft, Loader2, CheckCircle, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type Step = 'email' | 'otp' | 'success';

export function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('email');

  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setEmailError(t('forgotPassword.emailRequired')); return; }
    setEmailError('');
    setEmailLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || t('forgotPassword.failedToSendOtp'));
      setStep('otp');
    } catch (err: any) {
      setEmailError(err.message || t('forgotPassword.somethingWentWrong'));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) { setOtpError(t('forgotPassword.otpRequired')); return; }
    if (newPassword.length < 8) { setOtpError(t('forgotPassword.passwordMinLength')); return; }
    if (newPassword !== confirmPassword) { setOtpError(t('forgotPassword.passwordsNoMatch')); return; }
    setOtpError('');
    setOtpLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), otp: otpValue, new_password: newPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || t('forgotPassword.failedToResetPassword'));
      setStep('success');
    } catch (err: any) {
      setOtpError(err.message || t('forgotPassword.somethingWentWrong'));
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="p-8">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />{t('forgotPassword.backToLogin')}
            </Link>
            <AnimatePresence mode="wait">
              {step === 'email' && (
                <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Mail className="w-6 h-6 text-primary" /></div>
                    <div><h1 className="text-xl font-bold">{t('forgotPassword.step1Title')}</h1><p className="text-sm text-muted-foreground">{t('forgotPassword.step1Subtitle')}</p></div>
                  </div>
                  <form onSubmit={handleRequestOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t('forgotPassword.emailLabel')}</label>
                      <input id="forgot-email-input" type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailError(''); }} placeholder={t('forgotPassword.emailPlaceholder')} className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition" autoFocus required />
                    </div>
                    {emailError && (<motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{emailError}</motion.p>)}
                    <Button id="send-otp-btn" type="submit" className="w-full" disabled={emailLoading}>
                      {emailLoading ? (<span className="flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> {t('forgotPassword.sendingOtp')}</span>) : t('forgotPassword.sendOtp')}
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === 'otp' && (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-primary" /></div>
                    <div>
                      <h1 className="text-xl font-bold">{t('forgotPassword.step2Title')}</h1>
                      <p className="text-sm text-muted-foreground">{t('forgotPassword.step2Subtitle')} <br /><span className="font-medium text-foreground">{email}</span></p>
                    </div>
                  </div>
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-3">{t('forgotPassword.enterOtpLabel')}</label>
                      <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                        {otp.map((digit, i) => (
                          <input key={i} id={`otp-box-${i}`} ref={el => { otpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} className="w-12 h-14 text-center text-xl font-bold bg-background border-2 rounded-xl focus:outline-none focus:border-primary transition-colors" style={{ borderColor: digit ? 'hsl(var(--primary))' : undefined }} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{t('forgotPassword.didntReceive')}{' '}<button type="button" id="resend-otp-btn" onClick={() => setStep('email')} className="text-primary hover:underline font-medium">{t('forgotPassword.resendCode')}</button></p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t('forgotPassword.newPasswordLabel')}</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input id="new-password-input" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('forgotPassword.newPasswordPlaceholder')} className="w-full pl-9 pr-10 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition" required />
                        <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t('forgotPassword.confirmPasswordLabel')}</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input id="confirm-password-input" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={t('forgotPassword.confirmPasswordPlaceholder')} className={`w-full pl-9 pr-10 py-2.5 text-sm bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${confirmPassword && confirmPassword !== newPassword ? 'border-destructive focus:ring-destructive/50' : 'border-border'}`} required />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                      {confirmPassword && confirmPassword !== newPassword && (<p className="text-xs text-destructive mt-1">{t('forgotPassword.passwordsNoMatch')}</p>)}
                    </div>
                    {otpError && (<motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{otpError}</motion.p>)}
                    <Button id="reset-password-btn" type="submit" className="w-full" disabled={otpLoading}>
                      {otpLoading ? (<span className="flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> {t('forgotPassword.resetting')}</span>) : t('forgotPassword.resetPassword')}
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">{t('forgotPassword.successTitle')}</h2>
                  <p className="text-muted-foreground text-sm mb-8">{t('forgotPassword.successMessage')}<br />{t('forgotPassword.successSubMessage')}</p>
                  <Button id="go-to-login-btn" className="w-full" onClick={() => navigate('/login')}>{t('forgotPassword.goToLogin')}</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">&copy; {t('forgotPassword.branding')}</p>
      </motion.div>
    </div>
  );
}
