import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Search,
  MessageSquare,
  CheckCircle,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';

// Defined outside the component to avoid stale-closure in useEffect
const heroSlides = [
  {
    title: 'Promote Your Business',
    subtitle: 'Reach thousands of potential customers looking for your services',
    cta: 'Start Selling',
  },
  {
    title: 'Promote Your Requirements',
    subtitle: 'Find the perfect service provider for your needs',
    cta: 'Find Services',
  },
  {
    title: 'Secure Payment & Order Tracking',
    subtitle: 'Complete transactions with confidence and track every step',
    cta: 'Get Started',
  },
];

export function LandingPage() {
  const { theme, setTheme } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
  };

  useEffect(() => {
    resetInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    resetInterval();
  };

  const prevSlide = () => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () => goToSlide((currentSlide + 1) % heroSlides.length);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const stagger = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Syncro
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-6 py-24">
          <div className="relative h-96 flex items-center justify-center">
            {heroSlides.map((slide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: currentSlide === index ? 1 : 0,
                  x: currentSlide === index ? 0 : currentSlide > index ? -100 : 100,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 flex flex-col items-center justify-center text-center ${currentSlide === index ? 'pointer-events-auto' : 'pointer-events-none'
                  }`}
              >
                <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {slide.title}
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                  {slide.subtitle}
                </p>
                <div className="flex gap-4">
                  <Link to="/register">
                    <Button size="lg">
                      Promote My Requirement <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/register">
                    {/* Fixed: uses slide.cta text instead of hardcoded string */}
                    <Button size="lg" variant="outline">
                      {slide.cta} <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Carousel Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prevSlide}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? 'bg-primary w-8' : 'bg-muted'
                    }`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to success</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: Search,
                title: 'Discover or Promote',
                description: 'Browse services or list your business to attract customers',
              },
              {
                step: '2',
                icon: MessageSquare,
                title: 'Chat & Negotiate',
                description: 'Communicate directly, discuss requirements, and agree on terms',
              },
              {
                step: '3',
                icon: CheckCircle,
                title: 'Pay & Complete',
                description: 'Secure payment processing with order tracking and completion',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                {...stagger}
                transition={{ delay: index * 0.2 }}
              >
                <Card hover className="p-8 text-center h-full">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-primary mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
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
            <h2 className="text-4xl font-bold mb-4">Why Choose Syncro?</h2>
            <p className="text-xl text-muted-foreground">Benefits for buyers and sellers</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Buyer Benefits */}
            <motion.div {...fadeInUp}>
              <h3 className="text-2xl font-semibold mb-6 text-primary">For Buyers</h3>
              <div className="space-y-4">
                {[
                  'Access to verified service providers',
                  'Direct communication and negotiation',
                  'Secure payment protection',
                  'Order tracking and management',
                  'Review and rating system',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Seller Benefits */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <h3 className="text-2xl font-semibold mb-6 text-accent">For Sellers</h3>
              <div className="space-y-4">
                {[
                  'Reach thousands of potential customers',
                  'Showcase your business and services',
                  'Flexible pricing and negotiation',
                  'Secure and timely payments',
                  'Build reputation through reviews',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-xl text-muted-foreground">What our users say about us</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Buyer',
                text: 'Found the perfect designer for my project. The process was smooth and secure!',
                rating: 5,
              },
              {
                name: 'Michael Chen',
                role: 'Seller',
                text: 'Syncro helped me grow my business by 300% in just 3 months. Highly recommended!',
                rating: 5,
              },
              {
                name: 'Emily Rodriguez',
                role: 'Both',
                text: 'I use Syncro as both a buyer and seller. The dual-role feature is incredibly convenient.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                {...stagger}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">{testimonial.text}</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <motion.div {...fadeInUp} className="grid grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            {[
              { icon: Shield, text: 'Secure Payments' },
              { icon: Users, text: '10K+ Users' },
              { icon: Zap, text: 'Fast Processing' },
              { icon: TrendingUp, text: '99% Satisfaction' },
            ].map((badge, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <badge.icon className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-center">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We charge a small platform fee only when you successfully complete a transaction
            </p>
            <Card className="max-w-md mx-auto p-8">
              <div className="text-5xl font-bold text-primary mb-4">5%</div>
              <div className="text-xl mb-2">Platform Fee</div>
              <p className="text-muted-foreground">Only charged on successful transactions</p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-6 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl font-bold mb-6 text-white">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of users already growing their business on Syncro
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-semibold">Syncro</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The dual-role marketplace connecting buyers and sellers seamlessly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary">Features</Link></li>
                <li><Link to="#" className="hover:text-primary">Pricing</Link></li>
                <li><Link to="#" className="hover:text-primary">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary">About</Link></li>
                <li><Link to="#" className="hover:text-primary">Blog</Link></li>
                <li><Link to="#" className="hover:text-primary">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary">Help Center</Link></li>
                <li><Link to="#" className="hover:text-primary">Contact</Link></li>
                <li><Link to="#" className="hover:text-primary">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Syncro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
