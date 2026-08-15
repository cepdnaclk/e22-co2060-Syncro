import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Loader2, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { authApi } from '../services/api';

export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { verifyEmail } = useApp();

  const [email, setEmail] = useState('');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    // Read email from location state (passed from Register page)
    const stateEmail = location.state?.email;
    if (!stateEmail) {
      // If no email in state, redirect back to register
      navigate('/register', { replace: true });
    } else {
      setEmail(stateEmail);
    }
  }, [location, navigate]);

  useEffect(() => {
    // Cooldown timer for resend OTP
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await verifyEmail(email, otpValue);
      // On success, context sets auth state, redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      await authApi.resendVerification({ email });
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']); // Clear OTP inputs
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  // Mask email for display
  const maskedEmail = email ? email.replace(/(.{1})(.*)(?=@)/,
    (gp1, gp2, gp3) => {
      return gp2 + gp3.replace(/./g, '*');
    }
  ) : '';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="p-8">
            
            <AnimatePresence mode="wait">
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Verify your email</h1>
                    <p className="text-sm text-muted-foreground mt-1">We've sent a verification code to <br /><span className="font-medium text-foreground">{maskedEmail}</span></p>
                  </div>
                </div>
                
                <form onSubmit={handleVerify} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Enter the 6-digit code</label>
                    <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input 
                          key={i} 
                          ref={el => { otpRefs.current[i] = el; }} 
                          type="text" 
                          inputMode="numeric" 
                          maxLength={1} 
                          value={digit} 
                          onChange={e => handleOtpChange(i, e.target.value)} 
                          onKeyDown={e => handleOtpKeyDown(i, e)} 
                          className="w-12 h-14 text-center text-xl font-bold bg-background border-2 rounded-xl focus:outline-none focus:border-primary transition-colors" 
                          style={{ borderColor: digit ? 'hsl(var(--primary))' : undefined }} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                      {error}
                    </motion.p>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (<span className="flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</span>) : 'Verify Email'}
                  </Button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-3 text-sm">
                  <p className="text-muted-foreground">
                    Didn't receive the code?{' '}
                    <button 
                      type="button" 
                      onClick={handleResend} 
                      disabled={resendCooldown > 0 || resendLoading}
                      className="text-primary hover:underline font-medium disabled:opacity-50 disabled:no-underline"
                    >
                      {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </p>
                  
                  <Link to="/register" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />Change Email
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">&copy; {new Date().getFullYear()} Syncro Marketplace</p>
      </motion.div>
    </div>
  );
}
