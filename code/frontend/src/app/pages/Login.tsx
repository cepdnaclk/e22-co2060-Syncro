import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Moon, Sun, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';

export function Login() {
  const navigate = useNavigate();
  const { theme, setTheme, login } = useApp();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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
              Welcome back
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Experience the power of a dual-role marketplace. Set your budget, get competitive bids, and hire the best professionals safely.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-6">
            <Link to="/" className="flex justify-center -mb-2">
              <img
                src="/dark_nobg.png"
                alt="Syncro Logo"
                className="w-20 h-14 object-contain"
              />
            </Link>
            <h2 className="text-2xl font-bold mb-1 tracking-tight" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>Login</h2>
            <p className="text-sm text-muted-foreground">Access your account to continue</p>
          </div>

          <Card className="p-6 shadow-xl border-border/50">
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {error && (
                <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-border" />
                  <span>Remember me</span>
                </label>
                <Link to="#" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                  </span>
                ) : 'Login'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" className="w-full bg-background hover:bg-muted font-medium">
                Google
              </Button>
              <Button variant="outline" type="button" className="w-full bg-background hover:bg-muted font-medium">
                Apple
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-primary hover:underline">
                Sign up
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
