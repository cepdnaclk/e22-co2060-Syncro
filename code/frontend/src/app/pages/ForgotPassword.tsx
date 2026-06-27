import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowLeft, Loader2, CheckCircle, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Step types ──────────────────────────────────────────────────────────────
type Step = 'email' | 'otp' | 'success';

// ─── Main component ──────────────────────────────────────────────────────────
export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');

  // Email step
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // OTP step
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // ── Step 1: Request OTP ────────────────────────────────────────────────────
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setEmailError('Please enter your email address.'); return; }
    setEmailError('');
    setEmailLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send OTP');
      setStep('otp');
    } catch (err: any) {
      setEmailError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  // ── OTP input handling (Instagram-style 6-box) ────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value.slice(-1); // keep only last char
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Step 2: Verify OTP + Reset password ───────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) { setOtpError('Please enter all 6 digits of the OTP.'); return; }
    if (newPassword.length < 8) { setOtpError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setOtpError('Passwords do not match.'); return; }
    setOtpError('');
    setOtpLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otpValue, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to reset password');
      setStep('success');
    } catch (err: any) {
      setOtpError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">

          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="p-8">
            {/* Back to login */}
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Back to login
            </Link>

            <AnimatePresence mode="wait">

              {/* ── STEP 1: Enter email ── */}
              {step === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold">Forgot password?</h1>
                      <p className="text-sm text-muted-foreground">We'll send you a reset code</p>
                    </div>
                  </div>

                  <form onSubmit={handleRequestOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email address</label>
                      <input
                        id="forgot-email-input"
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        autoFocus
                        required
                      />
                    </div>

                    {emailError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                      >
                        {emailError}
                      </motion.p>
                    )}

                    <Button id="send-otp-btn" type="submit" className="w-full" disabled={emailLoading}>
                      {emailLoading ? (
                        <span className="flex items-center gap-2 justify-center">
                          <Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...
                        </span>
                      ) : 'Send OTP'}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── STEP 2: Enter OTP + new password ── */}
              {step === 'otp' && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold">Check your email</h1>
                      <p className="text-sm text-muted-foreground">
                        We sent a 6-digit code to <br />
                        <span className="font-medium text-foreground">{email}</span>
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-5">
                    {/* OTP boxes */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Enter OTP code</label>
                      <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            id={`otp-box-${i}`}
                            ref={el => { otpRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            className="w-12 h-14 text-center text-xl font-bold bg-background border-2 rounded-xl focus:outline-none focus:border-primary transition-colors"
                            style={{
                              borderColor: digit ? 'hsl(var(--primary))' : undefined,
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Didn't receive it?{' '}
                        <button
                          type="button"
                          id="resend-otp-btn"
                          onClick={() => setStep('email')}
                          className="text-primary hover:underline font-medium"
                        >
                          Resend code
                        </button>
                      </p>
                    </div>

                    {/* New password */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">New password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          id="new-password-input"
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          className="w-full pl-9 pr-10 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Confirm password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          id="confirm-password-input"
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className={`w-full pl-9 pr-10 py-2.5 text-sm bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${
                            confirmPassword && confirmPassword !== newPassword
                              ? 'border-destructive focus:ring-destructive/50'
                              : 'border-border'
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== newPassword && (
                        <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                      )}
                    </div>

                    {otpError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                      >
                        {otpError}
                      </motion.p>
                    )}

                    <Button id="reset-password-btn" type="submit" className="w-full" disabled={otpLoading}>
                      {otpLoading ? (
                        <span className="flex items-center gap-2 justify-center">
                          <Loader2 className="w-4 h-4 animate-spin" /> Resetting...
                        </span>
                      ) : 'Reset Password'}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── STEP 3: Success ── */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5"
                  >
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Password reset!</h2>
                  <p className="text-muted-foreground text-sm mb-8">
                    Your password has been changed successfully.<br />
                    You can now log in with your new password.
                  </p>
                  <Button
                    id="go-to-login-btn"
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    Go to Login
                  </Button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Branding */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2024 Syncro Marketplace · Secure Password Reset
        </p>
      </motion.div>
    </div>
  );
}
