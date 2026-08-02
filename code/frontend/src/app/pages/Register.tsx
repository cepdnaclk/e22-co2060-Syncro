import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Moon, Sun, Loader2, MapPin, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

export function Register() {
  const navigate = useNavigate();
  const { theme, setTheme, register } = useApp();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', location: '' });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.firstName) errors.firstName = t('register.firstNameRequired');
    if (!formData.lastName) errors.lastName = t('register.lastNameRequired');
    if (!formData.email) errors.email = t('register.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = t('register.emailInvalid');
    if (!formData.phone) errors.phone = t('register.phoneRequired');
    if (!formData.password) errors.password = t('register.passwordRequired');
    else if (formData.password.length < 6) errors.password = t('register.passwordMinLength');
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = t('register.passwordsNoMatch');
    if (!formData.location) errors.location = t('register.districtRequired');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName, formData.location, formData.phone);
      navigate('/dashboard');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : t('register.registrationFailed'));
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
            <h1 className="text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{t('register.heroTitle')}</h1>
            <p className="text-lg text-white/80 leading-relaxed">{t('register.heroSubtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-8 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md lg:max-w-lg">
          <div className="text-center mb-4">
            <Link to="/" className="flex justify-center -mb-2"><img src="/dark_nobg.png" alt="Syncro Logo" className="w-20 h-14 object-contain" /></Link>
            <h2 className="text-2xl font-bold mb-1 tracking-tight" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{t('register.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('register.subtitle')}</p>
          </div>

          <Card className="p-6 shadow-xl border-border/50">
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <Input type="text" label={t('register.firstNameLabel')} placeholder={t('register.firstNamePlaceholder')} value={formData.firstName} error={formErrors.firstName} onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); if (formErrors.firstName) setFormErrors({ ...formErrors, firstName: '' }); }} required />
                <Input type="text" label={t('register.lastNameLabel')} placeholder={t('register.lastNamePlaceholder')} value={formData.lastName} error={formErrors.lastName} onChange={(e) => { setFormData({ ...formData, lastName: e.target.value }); if (formErrors.lastName) setFormErrors({ ...formErrors, lastName: '' }); }} required />
              </div>
              <Input type="email" label={t('register.emailLabel')} placeholder={t('register.emailPlaceholder')} value={formData.email} error={formErrors.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (formErrors.email) setFormErrors({ ...formErrors, email: '' }); }} required />
              <Input type="tel" label={t('register.phoneLabel')} placeholder={t('register.phonePlaceholder')} value={formData.phone} error={formErrors.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' }); }} required />
              <Input type="password" label={t('register.passwordLabel')} placeholder={t('register.passwordPlaceholder')} value={formData.password} error={formErrors.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); if (formErrors.password) setFormErrors({ ...formErrors, password: '' }); }} required />
              <Input type="password" label={t('register.confirmPasswordLabel')} placeholder={t('register.passwordPlaceholder')} value={formData.confirmPassword} error={formErrors.confirmPassword} onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: '' }); }} required />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  {t('register.districtLabel')} <span className="text-destructive">*</span>
                </label>
                <Select value={formData.location} onValueChange={(val) => { setFormData({ ...formData, location: val }); if (formErrors.location) setFormErrors({ ...formErrors, location: '' }); }}>
                  <SelectTrigger id="district-select" className={formErrors.location ? 'border-destructive ring-destructive/20 ring-[3px]' : ''}>
                    <SelectValue placeholder={t('register.selectDistrict')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {SRI_LANKA_DISTRICTS.map((district) => (
                      <SelectItem key={district} value={district}>
                        {t(`districts.${district}`, district)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.location && <p className="text-xs text-destructive mt-0.5">{formErrors.location}</p>}
              </div>

              {apiError && (<div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">{apiError}</div>)}

              <div className="text-sm">
                <label className="flex items-start gap-2">
                  <input type="checkbox" className="rounded border-border mt-1" required />
                  <span className="text-muted-foreground">
                    {t('register.termsText')}{' '}
                    <Link to="#" className="text-primary hover:underline">{t('register.termsLink')}</Link>
                    {' '}{t('register.andText')}{' '}
                    <Link to="#" className="text-primary hover:underline">{t('register.privacyLink')}</Link>
                  </span>
                </label>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? (<span className="flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> {t('register.creatingAccount')}</span>) : t('register.createAccount')}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">{t('register.alreadyHaveAccount')} </span>
              <Link to="/login" className="text-primary hover:underline">{t('register.signIn')}</Link>
            </div>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-4">{t('register.accountRoles')}</p>
        </motion.div>
      </div>
    </div>
  );
}
