import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  User, 
  Briefcase, 
  ShieldCheck, 
  Settings, 
  Mail, 
  ChevronDown, 
  CheckCircle2, 
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

interface FAQItem {
  id: string;
  category: 'clients' | 'providers' | 'payments' | 'account';
  question: string;
  answer: string;
  badge?: string;
}

const FAQS: FAQItem[] = [
  // Clients
  {
    id: 'c1',
    category: 'clients',
    badge: 'Popular',
    question: 'Is it free to post a project or service request?',
    answer: 'Yes, posting requests on Syncro is 100% free with zero upfront charges. You can describe your job (such as a custom wedding cake, event catering, tuition, photography, or software development) in under 60 seconds and start receiving competitive bids.'
  },
  {
    id: 'c2',
    category: 'clients',
    question: 'How does the reverse auction work?',
    answer: 'Once your request is published, verified local service providers and small businesses across Sri Lanka review your requirements and submit competitive price quotes. Because providers compete to win your business, you get market-tested rates.'
  },
  {
    id: 'c3',
    category: 'clients',
    question: 'Am I required to accept the lowest bid?',
    answer: 'No, you have complete freedom to choose any provider. You can evaluate their past verified customer ratings, real Sri Lankan portfolio photos, turnaround time, or communication style before making your decision.'
  },
  {
    id: 'c4',
    category: 'clients',
    question: 'How do I communicate with providers before hiring?',
    answer: 'You can use Syncro’s built-in private chat to discuss specifics, clarify ingredients or equipment, exchange photos, and ask questions before accepting an offer.'
  },
  {
    id: 'c5',
    category: 'clients',
    question: 'What if the delivered work is unsatisfactory or delayed?',
    answer: 'You have a 3-day inspection window once a provider marks work as delivered. Your payment remains safely locked in Syncro. If revisions are needed, you can request them directly. If an impasse occurs, Syncro dispute support will step in to review the agreed scope and issue a fair determination or refund.'
  },

  // Providers
  {
    id: 'p1',
    category: 'providers',
    badge: 'Popular',
    question: 'How do I find new client leads in my district?',
    answer: 'You can browse live client requests on Syncro filtered by category (e.g. Cakes, Catering, Photography, Tutors, Web Dev) and district (e.g. Colombo, Kandy, Gampaha, Galle, or Island-wide delivery).'
  },
  {
    id: 'p2',
    category: 'providers',
    question: 'What fees does Syncro charge service providers?',
    answer: 'Syncro charges no subscription fees and no fees to submit bids. Syncro only retains a low 5% platform fee on successfully completed, approved, and released project milestones.'
  },
  {
    id: 'p3',
    category: 'providers',
    question: 'When and how do I receive my payout?',
    answer: 'When a client hires you, the payment is locked in Syncro upfront. Once you deliver and the client approves the work, funds are released directly to your verified payout details.'
  },
  {
    id: 'p4',
    category: 'providers',
    question: 'How can I win more client bids?',
    answer: 'Set up an authentic public storefront, upload high-quality photos of real past work in Sri Lanka, respond promptly to client questions, maintain a 5.0 star rating, and provide realistic turnaround timelines.'
  },

  // Payments & Safety
  {
    id: 's1',
    category: 'payments',
    badge: 'Essential',
    question: 'How does Syncro’s 100% Payment Protection work?',
    answer: 'Clients never hand cash or direct wire transfers to unfamiliar providers in advance. Payment is safely held by Syncro upon hiring and is only transferred to the service provider after the client inspects and approves the finished delivery.'
  },
  {
    id: 's2',
    category: 'payments',
    question: 'Can I pay or get paid in cash outside the app?',
    answer: 'Conducting transactions outside Syncro is strictly against our Anti-Circumvention Policy. Doing so voids all Payment Protection, dispute mediation, and verified review safeguards.'
  },
  {
    id: 's3',
    category: 'payments',
    question: 'How does dispute mediation work?',
    answer: 'If there is a disagreement over work quality or non-delivery, either party can raise a dispute. Syncro support will review in-app chat logs, original project requirements, and photos/deliverables to ensure a fair resolution.'
  },

  // Account
  {
    id: 'a1',
    category: 'account',
    question: 'Why do I need a valid Sri Lankan mobile phone number?',
    answer: 'We verify phone numbers via SMS OTP to keep Syncro free from bots, fraudulent bids, and spam. It also allows us to send critical real-time SMS alerts when you receive a new bid or payment confirmation.'
  },
  {
    id: 'a2',
    category: 'account',
    question: 'How do I reset my password?',
    answer: 'Go to the Login page and click “Forgot Password?”. Enter your registered email address to receive a 6-digit OTP code to safely reset your password.'
  },
  {
    id: 'a3',
    category: 'account',
    question: 'Can I both hire pros and offer my services with one account?',
    answer: 'Yes! Syncro accounts support dual roles seamlessly. You can post requests as a client while also bidding on opportunities as a service provider using the same login.'
  }
];

export function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'clients' | 'providers' | 'payments' | 'account'>('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>('c1');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactProjectId, setContactProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter(faq => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const toggleFaq = (id: string) => {
    setExpandedFaq(prev => prev === id ? null : id);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('syncromarketplace@gmail.com');
    setCopiedEmail(true);
    toast.success('Email copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Format mailto link with pre-filled subject and body
    const subject = encodeURIComponent(`[Syncro Support] ${contactSubject || 'General Inquiry'}`);
    const body = encodeURIComponent(
      `Name: ${contactName}\nEmail: ${contactEmail}\nProject ID: ${contactProjectId || 'N/A'}\n\nMessage:\n${contactMessage}`
    );
    
    setTimeout(() => {
      window.location.href = `mailto:syncromarketplace@gmail.com?subject=${subject}&body=${body}`;
      toast.success('Opening your email client to send message to syncromarketplace@gmail.com');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c0e17] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0c0e17]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                syn<span className="text-indigo-600 dark:text-indigo-400 group-hover:text-cyan-500 transition-colors">cro</span>
              </span>
            </Link>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-medium">
              Help Center & FAQ
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/terms"
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-b from-white via-indigo-50/30 to-slate-50 dark:from-[#101321] dark:via-[#101321] dark:to-[#0c0e17] border-b border-slate-200/80 dark:border-slate-800/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            Syncro Support & Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            How can we help you today?
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Find quick answers about posting requests, reverse auction bidding, 100% payment protection, and seller payouts across Sri Lanka.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topics (e.g. 'how bidding works', 'payouts', 'dispute', 'cake delivery')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-[#141829] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm sm:text-base transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {[
            { key: 'all', label: 'All Topics', icon: HelpCircle },
            { key: 'clients', label: 'For Clients (Hiring)', icon: User },
            { key: 'providers', label: 'For Service Pros (Bidding)', icon: Briefcase },
            { key: 'payments', label: 'Payment Protection', icon: ShieldCheck },
            { key: 'account', label: 'Account & Security', icon: Settings },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-[#111322] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQs List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions ({filteredFaqs.length})
              </h2>
              {searchQuery && (
                <span className="text-xs text-slate-500">
                  Matching "{searchQuery}"
                </span>
              )}
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#111322] rounded-2xl border border-slate-200 dark:border-slate-800">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">No matching answers found</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  Try searching with different keywords or contact our team directly at syncromarketplace@gmail.com.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} 
                  className="mt-4"
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white dark:bg-[#111322] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden transition-all shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900/60"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left p-5 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {faq.badge && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                              {faq.badge}
                            </span>
                          )}
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {faq.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                      <div className={`p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                        isExpanded ? 'rotate-180 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : ''
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Quick Links Card */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 dark:text-white text-sm">Need official policy documentation?</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Read our legal guarantees under Sri Lankan e-commerce laws.
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to="/terms" className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold hover:text-indigo-600 transition-colors">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Support Form */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            
            {/* Direct Email Card */}
            <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111322] rounded-2xl shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Direct Email Support</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Have an urgent question or dispute? Write directly to our support desk.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 truncate">
                  syncromarketplace@gmail.com
                </span>
                <button
                  onClick={copyEmail}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors flex-shrink-0"
                  title="Copy email address"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Usually responds within 24 hours (Monday – Saturday)
              </div>
            </Card>

            {/* In-App Support Message Form */}
            <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111322] rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Send a Message</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Fill this out and it will automatically prepare your email draft to our support team.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Ruwan Perera"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Topic *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Help with Cake order #1024 or Payout"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Order or Project ID (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. PRJ-2026-44"
                    value={contactProjectId}
                    onChange={(e) => setContactProjectId(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Describe your question or issue *
                  </label>
                  <Textarea
                    required
                    rows={3}
                    placeholder="Provide details so we can assist you quickly..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="text-xs resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-semibold"
                >
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  Send to syncromarketplace@gmail.com
                </Button>
              </form>
            </Card>

          </div>

        </div>

      </div>
    </div>
  );
}
