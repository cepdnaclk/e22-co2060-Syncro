import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Search, MessageSquare, CheckCircle, Shield, Zap, TrendingUp, Users, Star, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function LandingPage() {
  const { theme, setTheme, isAuthenticated, role, hasSellerProfile } = useApp();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Slides are derived from t() so they react to language changes
  const heroSlides = [
    { title: t('landing.heroSlide1Title'), subtitle: t('landing.heroSlide1Subtitle'), cta: t('landing.heroSlide1CTA') },
    { title: t('landing.heroSlide2Title'), subtitle: t('landing.heroSlide2Subtitle'), cta: t('landing.heroSlide2CTA') },
    { title: t('landing.heroSlide3Title'), subtitle: t('landing.heroSlide3Subtitle'), cta: t('landing.heroSlide3CTA') },
  ];

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % heroSlides.length); }, 5000);
  };

  useEffect(() => {
    resetInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const goToSlide = (index: number) => { setCurrentSlide(index); resetInterval(); };
  const prevSlide = () => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () => goToSlide((currentSlide + 1) % heroSlides.length);

  const fadeInUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
  const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  const authenticatedActions = [
    { label: t('landing.myDashboard'), icon: Search, to: '/dashboard' },
    { label: t('landing.discoverServices'), icon: TrendingUp, to: '/discover' },
    { label: t('landing.myOrders'), icon: Shield, to: '/orders' },
  ];
  const guestActions = [
    { label: t('landing.postYourNeed'), icon: Search, to: '/register' },
    { label: t('landing.startBidding'), icon: TrendingUp, to: '/register' },
    { label: t('landing.howItWorks'), icon: Shield, to: '/register' },
  ];
  const ctaActions = isAuthenticated ? authenticatedActions : guestActions;

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/dark_nobg.png" alt="Syncro Logo" className="w-24 h-24 rounded-xl object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 hover:bg-accent rounded-lg transition-colors">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard">
                  <Button>{role === 'seller' && hasSellerProfile ? t('nav.sellerDashboard') : t('nav.myDashboard')}<ArrowRight className="ml-2 w-4 h-4" /></Button>
                </Link>
                {role !== 'seller' && hasSellerProfile && (
                  <Link to="/dashboard"><Button variant="ghost">{t('nav.switchToSeller')}</Button></Link>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost">{t('common.login')}</Button></Link>
                <Link to="/register"><Button>{t('common.signup')}</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: theme === 'light' ? 'url("/main_light_bg.png")' : 'url("/main_bg.png")' }}>
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/70 backdrop-blur-[1px]" />
        <div className="absolute inset-0 hidden dark:block pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(2, 8, 30, 0.75) 100%)' }} />
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="relative h-96 flex items-center justify-center">
            {heroSlides.map((slide, index) => (
              <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: currentSlide === index ? 1 : 0, x: currentSlide === index ? 0 : currentSlide > index ? -100 : 100 }} transition={{ duration: 0.5 }} className={`absolute inset-0 flex flex-col items-center justify-center text-center ${currentSlide === index ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                <h1 className="text-6xl font-bold mb-6 pb-2 bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-300 dark:to-teal-300 bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{slide.title}</h1>
                <p className={`text-xl italic mb-8 max-w-2xl ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{slide.subtitle}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 mb-4">
            {ctaActions.map((action, i) => (
              <Link key={i} to={action.to}>
                <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer min-w-[180px]">
                  <action.icon className="w-5 h-5 flex-shrink-0" /><span>{action.label}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <button onClick={prevSlide} className="p-2 hover:bg-accent rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex gap-2">
              {heroSlides.map((_, index) => (
                <button key={index} onClick={() => goToSlide(index)} className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? 'bg-primary w-8' : 'bg-muted'}`} />
              ))}
            </div>
            <button onClick={nextSlide} className="p-2 hover:bg-accent rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 dark:text-white" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{t('landing.howItWorksTitle')}</h2>
            <p className="text-xl italic text-slate-600 dark:text-slate-400">{t('landing.howItWorksSubtitle')}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: Search, title: t('landing.step1Title'), description: t('landing.step1Description') },
              { step: '2', icon: MessageSquare, title: t('landing.step2Title'), description: t('landing.step2Description') },
              { step: '3', icon: CheckCircle, title: t('landing.step3Title'), description: t('landing.step3Description') },
            ].map((item, index) => (
              <motion.div key={index} {...stagger} transition={{ delay: index * 0.2 }}>
                <Card hover className="p-8 text-center h-full">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-600 to-teal-500 rounded-2xl flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-indigo-600 mb-2">{t('landing.step')} {item.step}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 dark:text-white" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{t('landing.advantageTitle')}</h2>
            <p className="text-xl italic text-slate-600 dark:text-slate-400">{t('landing.advantageSubtitle')}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fadeInUp}>
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/30 p-8 h-full">
                <h3 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">{t('landing.forBuyers')}</h3>
                <div className="space-y-5">
                  {[
                    { icon: Shield, text: t('landing.buyerBenefit1'), sub: t('landing.buyerBenefit1Sub') },
                    { icon: TrendingUp, text: t('landing.buyerBenefit2'), sub: t('landing.buyerBenefit2Sub') },
                    { icon: CheckCircle, text: t('landing.buyerBenefit3'), sub: t('landing.buyerBenefit3Sub') },
                    { icon: Star, text: t('landing.buyerBenefit4'), sub: t('landing.buyerBenefit4Sub') },
                    { icon: Zap, text: t('landing.buyerBenefit5'), sub: t('landing.buyerBenefit5Sub') },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <item.icon className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <div><span className="font-semibold text-base">{item.text}</span><p className="text-sm text-muted-foreground mt-0.5">{item.sub}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <div className="rounded-2xl border border-teal-200 dark:border-teal-900 bg-teal-50 dark:bg-teal-950/30 p-8 h-full">
                <h3 className="text-2xl font-bold mb-6 text-teal-600 dark:text-teal-400">{t('landing.forSellers')}</h3>
                <div className="space-y-5">
                  {[
                    { icon: Zap, text: t('landing.sellerBenefit1'), sub: t('landing.sellerBenefit1Sub') },
                    { icon: Users, text: t('landing.sellerBenefit2'), sub: t('landing.sellerBenefit2Sub') },
                    { icon: TrendingUp, text: t('landing.sellerBenefit3'), sub: t('landing.sellerBenefit3Sub') },
                    { icon: Shield, text: t('landing.sellerBenefit4'), sub: t('landing.sellerBenefit4Sub') },
                    { icon: Star, text: t('landing.sellerBenefit5'), sub: t('landing.sellerBenefit5Sub') },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <item.icon className="w-6 h-6 text-teal-500 flex-shrink-0 mt-0.5" />
                      <div><span className="font-semibold text-base">{item.text}</span><p className="text-sm text-muted-foreground mt-0.5">{item.sub}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 dark:text-white" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{t('landing.trustedTitle')}</h2>
            <p className="text-xl italic text-slate-600 dark:text-slate-400">{t('landing.trustedSubtitle')}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: t('landing.testimonial1Role'), initials: 'SJ', color: 'bg-indigo-500', text: t('landing.testimonial1Text'), rating: 5 },
              { name: 'Michael Chen', role: t('landing.testimonial2Role'), initials: 'MC', color: 'bg-teal-500', text: t('landing.testimonial2Text'), rating: 5 },
              { name: 'Emily Rodriguez', role: t('landing.testimonial3Role'), initials: 'ER', color: 'bg-indigo-600', text: t('landing.testimonial3Text'), rating: 5 },
            ].map((testimonial, index) => (
              <motion.div key={index} {...stagger} transition={{ delay: index * 0.2 }}>
                <Card className="p-6 h-full shadow-sm">
                  <div className="flex gap-1 mb-4">{[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />))}</div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{testimonial.text}</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>{testimonial.initials}</div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-slate-400 italic">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeInUp} className="grid grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            {[
              { icon: Shield, text: t('landing.badge1') },
              { icon: Users, text: t('landing.badge2') },
              { icon: Zap, text: t('landing.badge3') },
              { icon: TrendingUp, text: t('landing.badge4') },
            ].map((badge, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <badge.icon className="w-8 h-8 text-indigo-600" />
                <span className="text-sm font-medium text-center">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp}>
            <div className="max-w-5xl mx-auto rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-0">
                <div className="p-12 flex flex-col justify-center">
                  <h2 className="text-4xl font-bold text-[#1A1A1A] dark:text-white mb-8 leading-tight" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{t('landing.aboutTitle')}</h2>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-8">{t('landing.aboutDescription')}</p>
                  <Link to="/register">
                    <button className="group inline-flex items-center gap-3 px-8 py-3 rounded-full font-bold bg-slate-950 text-white dark:bg-white dark:text-slate-900 hover:shadow-lg transition-all">
                      {t('landing.learnMore')}<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
                <div className="relative p-12 flex flex-col justify-center gap-10 bg-cover bg-center" style={{ backgroundImage: theme === 'light' ? 'url("/dig.jpg")' : 'url("/dig1.jpg")' }}>
                  <div className="absolute inset-0 bg-slate-950/40" />
                  <div className="relative z-10 space-y-10">
                    {[
                      { value: '10,000+', label: t('landing.stat1Label') },
                      { value: '50,000+', label: t('landing.stat2Label') },
                      { value: '99%', label: t('landing.stat3Label') },
                    ].map((stat, i) => (
                      <div key={i} className="flex flex-col">
                        <div className="text-4xl font-bold text-white tracking-tight leading-none mb-1">{stat.value}</div>
                        <div className="text-white/90 font-semibold text-lg leading-tight">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="relative z-10 mt-6 pt-8 border-t border-white/20">
                    <p className="text-white font-bold text-2xl leading-none mb-2">{t('landing.platformFee')}</p>
                    <p className="text-white/80 font-medium text-lg">{t('landing.platformFeeSubtitle')}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{t('landing.pricingTitle')}</h2>
            <p className="text-base text-slate-400 mb-10 max-w-2xl mx-auto">{t('landing.pricingSubtitle')}</p>
            <div className="max-w-5xl mx-auto p-12 bg-indigo-50/40 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-indigo-100/50 dark:border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 dark:bg-indigo-600/15 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 dark:bg-teal-500/15 blur-[100px] pointer-events-none" />
              <div className="grid md:grid-cols-3 gap-8 relative z-10">
                <div className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6"><CheckCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /></div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('landing.postForFreeTitle')}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{t('landing.postForFreeDesc')}</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center mb-6"><Users className="w-8 h-8 text-slate-600 dark:text-slate-300" /></div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('landing.getUnlimitedBidsTitle')}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{t('landing.getUnlimitedBidsDesc')}</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6"><TrendingUp className="w-8 h-8 text-teal-600 dark:text-teal-400" /></div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('landing.payOnSuccessTitle')}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{t('landing.payOnSuccessDesc')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-teal-500">
        <div className="container mx-auto px-6 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl font-bold mb-6 text-white" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{t('landing.ctaTitle')}</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">{t('landing.ctaSubtitle')}</p>
            <Link to="/register"><Button size="lg" className="bg-white !text-indigo-700 hover:bg-indigo-50 font-semibold">{t('landing.createFreeAccount')} <ArrowRight className="ml-2 w-5 h-5" /></Button></Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4"><img src="/dark_nobg.png" alt="Syncro Logo" className="w-12 h-12 rounded-lg object-contain" /></div>
              <p className="text-muted-foreground text-sm">{t('landing.footerTagline')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footerProduct')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary">{t('landing.footerFeatures')}</Link></li>
                <li><Link to="#" className="hover:text-primary">{t('landing.footerPricing')}</Link></li>
                <li><Link to="#" className="hover:text-primary">{t('landing.footerSecurity')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footerCompany')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary">{t('landing.footerAbout')}</Link></li>
                <li><Link to="#" className="hover:text-primary">{t('landing.footerBlog')}</Link></li>
                <li><Link to="#" className="hover:text-primary">{t('landing.footerCareers')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footerSupport')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary">{t('landing.footerHelpCenter')}</Link></li>
                <li><Link to="#" className="hover:text-primary">{t('landing.footerContact')}</Link></li>
                <li><Link to="#" className="hover:text-primary">{t('landing.footerTerms')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {t('landing.footerCopyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
