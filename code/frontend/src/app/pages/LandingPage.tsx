import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'motion/react';
import {
  ArrowRight, Search, CheckCircle, Shield, Zap,
  TrendingUp, Users, Star, Moon, Sun, Sparkles, Send, Award, ChevronRight,
  ChevronLeft, Briefcase, Lock, FileText, CheckCircle2, Clock, ArrowUpRight,
  ShieldCheck, BarChart3, Layers, Bot, Globe, Coins, Laptop, BadgeCheck,
  Code2, Palette, Megaphone, Video, Calculator, Wrench, Handshake, DollarSign,
  UtensilsCrossed, Cake, Flower2, Camera, GraduationCap
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

/* ─── Animated Counter Component ─── */
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (target >= 1000) return Math.round(v).toLocaleString();
    return Math.round(v).toString();
  });

  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration: 2, ease: [0.16, 1, 0.3, 1] });
    }
  }, [isInView, target, count]);

  return (
    <span ref={ref} className="tabular-nums font-extrabold tracking-tight">
      {prefix}<motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
}

/* ─── Modern Subtle Background Accents ─── */
function AmbientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-25 dark:opacity-15 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)', top: '-10%', right: '-5%' }}
        animate={{ x: [0, 30, 0], y: [0, -25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10 blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 70%)', bottom: '15%', left: '-5%' }}
        animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
}

/* ─── Popular Sri Lankan Small Businesses Slideshow Data ─── */
const BUSINESS_DATA = [
  { id: 'cakes', key: 'cakes', icon: Cake, image: '/images/sl_baker.jpg' },
  { id: 'catering', key: 'catering', icon: UtensilsCrossed, image: '/images/sl_catering.jpg' },
  { id: 'bridal', key: 'bridal', icon: Sparkles, image: '/images/sl_bridal.jpg' },
  { id: 'florists', key: 'florists', icon: Flower2, image: '/images/sl_florist.jpg' },
  { id: 'photography', key: 'photography', icon: Camera, image: '/images/sl_photographer.jpg' },
  { id: 'web-dev', key: 'webDev', icon: Code2, image: '/images/sri_lankan_team.jpg' },
  { id: 'tutors', key: 'tutors', icon: GraduationCap, image: '/images/sl_tutor.jpg' },
  { id: 'branding', key: 'branding', icon: Palette, image: '/images/diverse_pros.jpg' }
];

export function LandingPage() {
  const { theme, setTheme, isAuthenticated, role, hasSellerProfile } = useApp();
  const { t } = useTranslation();
  const [roleView, setRoleView] = useState<'buyer' | 'seller'>('buyer');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPerspectivePaused, setIsPerspectivePaused] = useState(false);

  // Auto-play toggle between Buyer and Seller every 6 seconds (pauses on user hover)
  useEffect(() => {
    if (isPerspectivePaused) return;
    const timer = setInterval(() => {
      setRoleView((prev) => (prev === 'buyer' ? 'seller' : 'buyer'));
    }, 6000);
    return () => clearInterval(timer);
  }, [isPerspectivePaused]);

  const popularBusinesses = BUSINESS_DATA.map((item) => ({
    id: item.id,
    icon: item.icon,
    image: item.image,
    category: t(`landing.slideshow.categories.${item.key}.category`),
    badge: t(`landing.slideshow.categories.${item.key}.badge`),
    title: t(`landing.slideshow.categories.${item.key}.title`),
    desc: t(`landing.slideshow.categories.${item.key}.desc`),
    sampleRequest: t(`landing.slideshow.categories.${item.key}.sampleRequest`),
    priceRange: t(`landing.slideshow.categories.${item.key}.priceRange`),
    bids: t(`landing.slideshow.categories.${item.key}.bids`),
    location: t(`landing.slideshow.categories.${item.key}.location`),
    shortName: t(`landing.slideshow.categories.${item.key}.shortName`)
  }));

  // Auto-play slideshow every 4.5 seconds (pauses on user hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % popularBusinesses.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, popularBusinesses.length]);

  const [scrolled, setScrolled] = useState(false);

  // Keep track of scroll position to enhance header elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % popularBusinesses.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + popularBusinesses.length) % popularBusinesses.length);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
  };

  const activeBusiness = popularBusinesses[currentSlide] || popularBusinesses[0];

  return (
    <div className="min-h-screen bg-[#fafbff] dark:bg-[#090a12] text-foreground font-sans selection:bg-indigo-500 selection:text-white pt-20">

      {/* ═══════════════════ PERMANENTLY FIXED TOP HEADER ═══════════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#090a12]/95 backdrop-blur-xl shadow-md border-b border-slate-200/80 dark:border-white/10'
          : 'bg-white/90 dark:bg-[#090a12]/90 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5'
      }`}>
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/dark_nobg.png" alt="Syncro Logo" className="h-10 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg leading-none bg-gradient-to-r from-slate-950 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                SYNCRO
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-0.5">
                {t('landing.header.subtitle')}
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#popular-businesses" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {t('landing.header.popularBusinesses')}
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {t('landing.header.howItWorks')}
            </a>
            <a href="#grow-business" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {t('landing.header.forWho')}
            </a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {t('landing.header.pricing')}
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-300" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-600/20">
                    {role === 'seller' && hasSellerProfile ? t('nav.sellerDashboard') : t('nav.myDashboard')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                {role !== 'seller' && hasSellerProfile && (
                  <Link to="/dashboard" className="hidden sm:inline-block">
                    <Button variant="ghost">{t('nav.switchToSeller')}</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="font-medium text-slate-700 dark:text-slate-200">
                    {t('common.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-semibold shadow-md">
                    {t('landing.header.signUpFree')}
                    <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        <AmbientBackground />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Authentic & Simple Value Proposition */}
            <div className="lg:col-span-7 text-left max-w-2xl">
              
              {/* National First-Mover Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/90 dark:bg-indigo-950/40 backdrop-blur-md"
              >
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  {t('landing.hero.badge')}
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15] mb-6"
              >
                {t('landing.hero.title1')}{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 bg-clip-text text-transparent">
                  {t('landing.hero.titleHighlight')}
                </span>{' '}
                {t('landing.hero.title2')}
              </motion.h1>

              {/* Clear Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8"
              >
                <strong>{t('landing.hero.subBuyerLead')}</strong> {t('landing.hero.subBuyer')}
                <br className="mt-2 block" />
                <strong>{t('landing.hero.subSellerLead')}</strong> {t('landing.hero.subSeller')}
              </motion.p>

              {/* Dual Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10"
              >
                <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                  <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:shadow-indigo-600/35 hover:-translate-y-0.5 text-base">
                    <Search className="w-5 h-5" />
                    {t('landing.hero.btnBuyer')}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </Link>
                <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                  <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-white dark:bg-white/[0.04] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-0.5 text-base shadow-sm">
                    <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    {t('landing.hero.btnSeller')}
                  </button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/80 dark:border-white/10"
              >
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    <AnimatedCounter target={100} suffix="%" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('landing.hero.stat1Label')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    <AnimatedCounter target={2500} suffix="+" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('landing.hero.stat2Label')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    <AnimatedCounter target={5} suffix=" Min" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('landing.hero.stat3Label')}</div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Authentic Sri Lankan Professional Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-3xl p-3 bg-gradient-to-b from-indigo-100 to-slate-200/50 dark:from-white/10 dark:to-white/[0.02] shadow-2xl border border-white/60 dark:border-white/10">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 shadow-inner group">
                  <img
                    src="/images/sri_lankan_pro.jpg"
                    alt="Sri Lankan entrepreneur working on Syncro platform in Colombo"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Widget 1: Payout Guarantee & Payment Protection */}
                <motion.div
                  initial={{ opacity: 0, x: -15, y: 15 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="absolute -bottom-5 -left-4 z-20 bg-white/95 dark:bg-[#111322]/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-xl border border-slate-200/80 dark:border-white/10 flex items-center gap-3 max-w-[240px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('landing.hero.widget1Tag')}</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{t('landing.hero.widget1Title')}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{t('landing.hero.widget1Desc')}</div>
                  </div>
                </motion.div>

                {/* Floating Widget 2: Pro Reputation & Location */}
                <motion.div
                  initial={{ opacity: 0, x: 15, y: -15 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.65 }}
                  className="absolute -top-5 -right-3 z-20 bg-white/95 dark:bg-[#111322]/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-xl border border-slate-200/80 dark:border-white/10 flex items-center gap-3 max-w-[230px]"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{t('landing.hero.widget2Title')}</span>
                      <BadgeCheck className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('landing.hero.widget2Subtitle')}</div>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════════ POPULAR SRI LANKAN BUSINESSES SLIDESHOW ═══════════════════ */}
      <section
        id="popular-businesses"
        className="py-24 bg-white dark:bg-white/[0.01] border-y border-slate-200/70 dark:border-white/5 relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {t('landing.slideshow.tag')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              {t('landing.slideshow.heading')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
              {t('landing.slideshow.sub')}
            </p>
          </motion.div>

          {/* The Main Interactive Carousel Card */}
          <div className="max-w-6xl mx-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBusiness.id}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 shadow-xl overflow-hidden"
              >
                <div className="grid lg:grid-cols-12 gap-0 items-stretch">
                  
                  {/* Left Column: Authentic Photography of the Business */}
                  <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[480px] overflow-hidden group">
                    <img
                      src={activeBusiness.image}
                      alt={activeBusiness.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    {/* Bottom overlay badge */}
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white text-xs bg-slate-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{t('landing.slideshow.latestRequest')}</div>
                        <div className="font-bold text-sm text-white mt-0.5">{activeBusiness.sampleRequest}</div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-teal-400 font-bold text-sm font-mono">{activeBusiness.priceRange}</div>
                        <div className="text-[10px] text-indigo-300 font-semibold">{activeBusiness.bids}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Business Details & Action */}
                  <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                          <activeBusiness.icon className="w-3.5 h-3.5" />
                          {activeBusiness.category}
                        </div>
                        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                          {activeBusiness.badge}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white leading-tight mb-4">
                        {activeBusiness.title}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base mb-6">
                        {activeBusiness.desc}
                      </p>

                      <div className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>{t('landing.slideshow.bullet1')}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <span>{t('landing.slideshow.bullet2')}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          <span>{t('landing.slideshow.bullet3')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-4">
                      <Link to="/register" className="flex-1">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md">
                          {t('landing.slideshow.postRequestBtn')}
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      </Link>

                      {/* Manual Carousel Navigation Arrows */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={prevSlide}
                          aria-label="Previous slide"
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextSlide}
                          aria-label="Next slide"
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators / Category Thumbnails */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {popularBusinesses.map((item, index) => {
                const isSelected = index === currentSlide;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md scale-105'
                        : 'bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.shortName}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════ DUAL PERSPECTIVE: HIRE OR GROW ═══════════════════ */}
      <section id="grow-business" className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              {t('landing.dualPerspective.heading')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              {t('landing.dualPerspective.sub')}
            </p>

            {/* Toggle Switch with Auto-Play Controls */}
            <div 
              onMouseEnter={() => setIsPerspectivePaused(true)}
              onMouseLeave={() => setIsPerspectivePaused(false)}
              className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-white/10 backdrop-blur-md shadow-inner"
            >
              <button
                onClick={() => { setRoleView('buyer'); setIsPerspectivePaused(true); }}
                className={`relative px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  roleView === 'buyer'
                    ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {t('landing.dualPerspective.buyerTab')}
              </button>
              <button
                onClick={() => { setRoleView('seller'); setIsPerspectivePaused(true); }}
                className={`relative px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  roleView === 'seller'
                    ? 'bg-white dark:bg-teal-600 text-slate-900 dark:text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {t('landing.dualPerspective.sellerTab')}
              </button>
            </div>

            {/* Slideshow Indicator Dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => { setRoleView('buyer'); setIsPerspectivePaused(true); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  roleView === 'buyer'
                    ? 'w-8 bg-indigo-600 dark:bg-indigo-400'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                aria-label="Client perspective"
              />
              <button
                onClick={() => { setRoleView('seller'); setIsPerspectivePaused(true); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  roleView === 'seller'
                    ? 'w-8 bg-teal-600 dark:bg-teal-400'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                aria-label="Provider perspective"
              />
            </div>
          </motion.div>

          {/* Interactive Toggle Showcase with Images & Auto-Slideshow */}
          <div 
            className="max-w-5xl mx-auto relative group"
            onMouseEnter={() => setIsPerspectivePaused(true)}
            onMouseLeave={() => setIsPerspectivePaused(false)}
          >
            <AnimatePresence mode="wait">
              {roleView === 'buyer' ? (
                <motion.div
                  key="buyer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 p-8 sm:p-12 shadow-xl relative overflow-hidden"
                >
                  <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
                        {t('landing.dualPerspective.buyerBadge')}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        {t('landing.dualPerspective.buyerTitle')}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                        {t('landing.dualPerspective.buyerDesc')}
                      </p>
                      <div className="space-y-3.5 mb-8">
                        {[
                          t('landing.dualPerspective.buyerBullet1'),
                          t('landing.dualPerspective.buyerBullet2'),
                          t('landing.dualPerspective.buyerBullet3'),
                          t('landing.dualPerspective.buyerBullet4')
                        ].map((pt, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{pt}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4">
                        <Link to="/register">
                          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20">
                            {t('landing.dualPerspective.buyerBtn')}
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                        <button
                          onClick={() => setRoleView('seller')}
                          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
                        >
                          Looking for work instead? Switch &rarr;
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-white/10 aspect-[4/3] bg-slate-950 relative group/img">
                      <img
                        src="/images/sl_client_quotes.jpg"
                        alt="Sri Lankan client reviewing service quotes"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-slate-200/60 dark:border-white/10 flex items-center gap-2 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Competitive Bids
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="seller"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 p-8 sm:p-12 shadow-xl relative overflow-hidden"
                >
                  <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-4">
                        {t('landing.dualPerspective.sellerBadge')}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        {t('landing.dualPerspective.sellerTitle')}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                        {t('landing.dualPerspective.sellerDesc')}
                      </p>
                      <div className="space-y-3.5 mb-8">
                        {[
                          t('landing.dualPerspective.sellerBullet1'),
                          t('landing.dualPerspective.sellerBullet2'),
                          t('landing.dualPerspective.sellerBullet3'),
                          t('landing.dualPerspective.sellerBullet4')
                        ].map((pt, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{pt}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4">
                        <Link to="/register">
                          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md shadow-teal-600/20">
                            {t('landing.dualPerspective.sellerBtn')}
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                        <button
                          onClick={() => setRoleView('buyer')}
                          className="text-xs font-semibold text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1"
                        >
                          Need work done instead? Switch &rarr;
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-white/10 aspect-[4/3] bg-slate-950 relative group/img">
                      <img
                        src="/images/sri_lankan_team.jpg"
                        alt="Sri Lankan creative professionals collaborating"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-slate-200/60 dark:border-white/10 flex items-center gap-2 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        Guaranteed Payment Protection
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS (3 SIMPLE STEPS) ═══════════════════ */}
      <section id="how-it-works" className="py-24 bg-slate-50/70 dark:bg-white/[0.01] border-y border-slate-200/70 dark:border-white/5">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2 block">
              {t('landing.howItWorks.tag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              {t('landing.howItWorks.title')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {t('landing.howItWorks.desc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: t('landing.howItWorks.step1Title'),
                desc: t('landing.howItWorks.step1Desc'),
                icon: FileText
              },
              {
                step: '02',
                title: t('landing.howItWorks.step2Title'),
                desc: t('landing.howItWorks.step2Desc'),
                icon: TrendingUp
              },
              {
                step: '03',
                title: t('landing.howItWorks.step3Title'),
                desc: t('landing.howItWorks.step3Desc'),
                icon: ShieldCheck
              }
            ].map((st, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="p-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 shadow-sm relative group hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <st.icon className="w-6 h-6" />
                  </div>
                  <span className="text-4xl font-black text-slate-200 dark:text-white/10 select-none">
                    {st.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{st.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{st.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ REAL SRI LANKAN STORIES ═══════════════════ */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2 block">
              {t('landing.testimonials.tag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {t('landing.testimonials.desc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed italic mb-6">
                  {t('landing.testimonials.story1Quote')}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <img src="/images/sri_lankan_pro.jpg" alt="Maya Bandara" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">Maya Bandara</div>
                  <div className="text-xs text-slate-500">{t('landing.testimonials.story1Role')}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed italic mb-6">
                  {t('landing.testimonials.story2Quote')}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm">
                  DP
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">David Perera</div>
                  <div className="text-xs text-slate-500">{t('landing.testimonials.story2Role')}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TRANSPARENT PRICING ═══════════════════ */}
      <section id="pricing" className="py-20 bg-slate-50/70 dark:bg-white/[0.01] border-y border-slate-200/70 dark:border-white/5">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2 block">
              {t('landing.pricing.tag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {t('landing.pricing.desc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-7 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 text-center">
              <div className="text-indigo-600 dark:text-indigo-400 font-extrabold text-3xl mb-1">{t('landing.pricing.tier1Price')}</div>
              <div className="font-bold text-slate-900 dark:text-white text-base mb-2">{t('landing.pricing.tier1Title')}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('landing.pricing.tier1Desc')}</p>
            </div>

            <div className="p-7 rounded-2xl bg-white dark:bg-white/[0.03] border-2 border-indigo-500/50 shadow-lg text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                {t('landing.pricing.tier2Badge')}
              </div>
              <div className="text-indigo-600 dark:text-indigo-400 font-extrabold text-3xl mb-1">{t('landing.pricing.tier2Price')}</div>
              <div className="font-bold text-slate-900 dark:text-white text-base mb-2">{t('landing.pricing.tier2Title')}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('landing.pricing.tier2Desc')}</p>
            </div>

            <div className="p-7 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 text-center">
              <div className="text-teal-600 dark:text-teal-400 font-extrabold text-3xl mb-1">{t('landing.pricing.tier3Price')}</div>
              <div className="font-bold text-slate-900 dark:text-white text-base mb-2">{t('landing.pricing.tier3Title')}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('landing.pricing.tier3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CALL TO ACTION ═══════════════════ */}
      <section className="py-24 relative overflow-hidden bg-white dark:bg-[#090a12]">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto rounded-3xl p-10 sm:p-16 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 text-white shadow-2xl relative overflow-hidden text-center">
            <motion.div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }}
            />

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              {t('landing.cta.title')}
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
              {t('landing.cta.sub')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-white text-indigo-700 hover:bg-slate-50 transition-all shadow-xl hover:-translate-y-0.5 text-base">
                  {t('landing.cta.btnRegister')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/login">
                <button className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-xl font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all text-base">
                  {t('landing.cta.btnLogin')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-slate-50 dark:bg-[#06070d] border-t border-slate-200/80 dark:border-white/5 py-14">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/dark_nobg.png" alt="Syncro Logo" className="h-8 w-auto object-contain" />
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">SYNCRO</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                {t('landing.footer.desc')}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4">{t('landing.footer.forClients')}</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/register" className="hover:text-indigo-600 transition-colors">{t('landing.footer.postRequest')}</Link></li>
                <li><a href="#popular-businesses" className="hover:text-indigo-600 transition-colors">{t('landing.footer.browseServices')}</a></li>
                <li><a href="#how-it-works" className="hover:text-indigo-600 transition-colors">{t('landing.footer.howBiddingWorks')}</a></li>
                <li><a href="#pricing" className="hover:text-indigo-600 transition-colors">{t('landing.footer.escrowProtection')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4">{t('landing.footer.forPros')}</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/register" className="hover:text-indigo-600 transition-colors">{t('landing.footer.findLeads')}</Link></li>
                <li><Link to="/register" className="hover:text-indigo-600 transition-colors">{t('landing.footer.createStorefront')}</Link></li>
                <li><a href="#pricing" className="hover:text-indigo-600 transition-colors">{t('landing.footer.lowFee')}</a></li>
                <li><Link to="/login" className="hover:text-indigo-600 transition-colors">{t('landing.footer.providerSignIn')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4">{t('landing.footer.support')}</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/help" className="hover:text-indigo-600 transition-colors">{t('landing.footer.helpCenter')}</Link></li>
                <li><Link to="/terms#payments" className="hover:text-indigo-600 transition-colors">{t('landing.footer.safetyPolicy')}</Link></li>
                <li><Link to="/terms" className="hover:text-indigo-600 transition-colors">{t('landing.footer.terms')}</Link></li>
                <li><Link to="/privacy" className="hover:text-indigo-600 transition-colors">{t('landing.footer.privacy')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} {t('landing.footer.builtInSL')}</p>
            <p className="mt-2 sm:mt-0">{t('landing.footer.connectingIslandWide')}</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
