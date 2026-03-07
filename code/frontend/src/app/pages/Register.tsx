import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Moon, Sun, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';

export function Register() {
  const navigate = useNavigate();
  const { theme, setTheme, register } = useApp();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please try again.');
      setFormData({ ...formData, confirmPassword: '' });
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-blue-50 dark:bg-background">
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="absolute top-6 right-6 z-50 p-2 hover:bg-accent rounded-lg transition-colors bg-background/50 backdrop-blur-md border border-border"
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      {/* Left Column - Hero */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center flex-col justify-center p-10 overflow-hidden"
        style={{ backgroundImage: theme === 'light' ? 'url("/dig.jpg")' : 'url("/dig1.jpg")' }}
      >
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="relative z-10 text-white max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
              Create your account
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Your gateway to verified professionals and direct leads. Create your account and start syncing.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md lg:max-w-lg"
        >
          <div className="text-center mb-4">
            <Link to="/" className="flex justify-center -mb-2">
              <img
                src="/dark_nobg.png"
                alt="Syncro Logo"
                className="w-20 h-14 object-contain"
              />
            </Link>
            <h2 className="text-2xl font-bold mb-1 tracking-tight" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>Create account</h2>
            <p className="text-sm text-muted-foreground">Join Syncro as a buyer, seller, or both</p>
          </div>

          <Card className="p-6 shadow-xl border-border/50">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <Input
                  type="text"
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />

              <Input
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (error) setError('');
                }}
                required
              />

              {error && (
                <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="text-sm">
                <label className="flex items-start gap-2">
                  <input type="checkbox" className="rounded border-border mt-1" required />
                  <span className="text-muted-foreground">
                    I agree to the{' '}
                    <Link to="#" className="text-primary hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>
                  </span>
                </label>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
                  </span>
                ) : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-4">
            One account supports both Buyer and Seller roles
          </p>
        </motion.div>
      </div>
    </div>
  );
}
