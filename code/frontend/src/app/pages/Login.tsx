import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Moon, Sun, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function Login() {
  const navigate = useNavigate();
  const { theme, setTheme, login } = useApp();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.email) errors.email = t('login.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = t('login.emailInvalid');
    if (!formData.password) errors.password = t('login.passwordRequired');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setApiError(msg && !msg.toLowerCase().includes('fetch') && !msg.toLowerCase().includes('network') ? msg : t('login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-blue-50 dark:bg-background">
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
        <LanguageSwitcher />
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 hover:bg-accent rounded-lg transition-colors bg-background/50 backdrop-blur-md border border-border">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center flex-col justify-center p-10 overflow-hidden" style={{ backgroundImage: theme === 'light' ? 'url("/dig.jpg")' : 'url("/dig1.jpg")' }}>
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="relative z-10 text-white max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{t('login.heroTitle')}</h1>
            <p className="text-lg text-white/80 leading-relaxed">{t('login.heroSubtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-8 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link to="/" className="flex justify-center -mb-2"><img src="/dark_nobg.png" alt="Syncro Logo" className="w-20 h-14 object-contain" /></Link>
            <h2 className="text-2xl font-bold mb-1 tracking-tight" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{t('login.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('login.subtitle')}</p>
          </div>
          <Card className="p-6 shadow-xl border-border/50">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input type="email" label={t('login.emailLabel')} placeholder={t('login.emailPlaceholder')} value={formData.email} error={formErrors.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (formErrors.email) setFormErrors({ ...formErrors, email: '' }); }} required />
              <Input type="password" label={t('login.passwordLabel')} placeholder={t('login.passwordPlaceholder')} value={formData.password} error={formErrors.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); if (formErrors.password) setFormErrors({ ...formErrors, password: '' }); }} required />
              {apiError && (<div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">{apiError}</div>)}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-border" /><span>{t('login.rememberMe')}</span></label>
                <Link to="/forgot-password" className="text-primary hover:underline">{t('login.forgotPassword')}</Link>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (<span className="flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> {t('login.loggingIn')}</span>) : t('login.loginButton')}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">{t('login.orContinueWith')}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" className="w-full bg-background hover:bg-muted font-medium">Google</Button>
              <Button variant="outline" type="button" className="w-full bg-background hover:bg-muted font-medium">Apple</Button>
            </div>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">{t('login.noAccount')} </span>
              <Link to="/register" className="text-primary hover:underline">{t('login.signUp')}</Link>
            </div>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-4">{t('login.accountRoles')}</p>
        </motion.div>
      </div>
    </div>
  );
}
