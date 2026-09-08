import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Scale, 
  AlertCircle, 
  CreditCard, 
  Lock, 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Printer
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TermsOfService() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>('intro');

  const sections = [
    { id: 'intro', title: '1. Introduction & Acceptance' },
    { id: 'role', title: '2. Role of Syncro Marketplace' },
    { id: 'accounts', title: '3. Accounts & Verification' },
    { id: 'auction', title: '4. Reverse Auction & Bidding Rules' },
    { id: 'payments', title: '5. Payment Protection & Platform Fees' },
    { id: 'circumvention', title: '6. Anti-Circumvention Policy' },
    { id: 'cancellations', title: '7. Cancellations & Disputes' },
    { id: 'conduct', title: '8. Prohibited Activities' },
    { id: 'ip', title: '9. Intellectual Property' },
    { id: 'liability', title: '10. Limitation of Liability' },
    { id: 'law', title: '11. Governing Law (Sri Lanka)' },
    { id: 'contact', title: '12. Contact & Support' },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
              Legal Documents
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <Link
              to="/privacy"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Privacy Policy <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Title */}
      <section className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#101321] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            Effective Date: March 2026 • Sri Lanka
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Please read these terms carefully before using Syncro. These terms explain your rights, responsibilities, our reverse auction system, and our 100% payment protection policy.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sticky Table of Contents Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 space-y-3 bg-white dark:bg-[#111322] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
                Contents
              </h2>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left text-xs sm:text-sm py-2 px-3 rounded-lg transition-all font-medium block truncate ${
                      activeSection === sec.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Payment Protected
                  </div>
                  Syncro holds funds until work is approved by the client.
                </div>
              </div>
            </div>
          </aside>

          {/* Legal Text Body */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-12 bg-white dark:bg-[#111322] p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm leading-relaxed text-sm sm:text-base">
            
            {/* Section 1 */}
            <section id="intro" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-sm font-bold">1</span>
                Introduction & Acceptance of Terms
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Welcome to <strong>Syncro</strong> (“Syncro”, “we”, “our”, or “us”), Sri Lanka’s premier reverse-auction marketplace connecting clients (“Clients” or “Buyers”) with qualified independent service providers, small businesses, and freelancers (“Providers” or “Sellers”).
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                By creating an account, clicking “Create Account”, or browsing our platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service and our <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 underline font-medium">Privacy Policy</Link>. If you do not agree to these terms, you must not access or use Syncro.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white">In Plain Terms:</strong> By using Syncro, you agree to play by the rules outlined here. Both clients and service providers are expected to act honestly, respectfully, and professionally.
              </div>
            </section>

            {/* Section 2 */}
            <section id="role" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-sm font-bold">2</span>
                Role of Syncro Marketplace
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Syncro operates strictly as an <strong>intermediary technology platform</strong>. We do not provide catering, baking, photography, tutoring, software development, or any of the underlying services listed on the marketplace.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-2">
                <li>Providers are independent businesses or freelance contractors, not employees or partners of Syncro.</li>
                <li>Syncro does not dictate how, where, or when Providers carry out their services.</li>
                <li>Syncro provides the platform to discover requests, submit competitive bids, communicate, and securely manage project payouts.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="accounts" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-sm font-bold">3</span>
                Accounts, Eligibility & Verification
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                To use Syncro, you must register for an account and provide accurate, up-to-date information:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Eligibility</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    You must be at least 18 years of age or possess legal parental/guardian consent to enter into binding agreements in Sri Lanka.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Authentic Details</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    You must supply a valid Sri Lankan mobile phone number, email address, and accurate district information. Impersonation is strictly prohibited.
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                You are solely responsible for maintaining the confidentiality of your credentials (including passwords and OTP verification codes). You agree to notify us immediately of any unauthorized access to your account.
              </p>
            </section>

            {/* Section 4 */}
            <section id="auction" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-sm font-bold">4</span>
                Reverse Auction & Bidding Rules
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Syncro enables a transparent <strong>reverse auction</strong> where clients post tasks and verified service providers place competitive bids:
              </p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Posting Requests (Clients):</strong>
                    <span className="text-slate-600 dark:text-slate-300 text-sm block mt-0.5">
                      Posting is 100% free. Requests must specify genuine requirements, realistic scopes, and legitimate budgets. Misleading or spam postings will be removed immediately.
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Bidding (Providers):</strong>
                    <span className="text-slate-600 dark:text-slate-300 text-sm block mt-0.5">
                      Providers submit quotes based on their genuine capacity to deliver the work on time. A submitted bid represents a firm, professional proposal to perform the specified job at that price.
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Client Selection Freedom:</strong>
                    <span className="text-slate-600 dark:text-slate-300 text-sm block mt-0.5">
                      Clients are never obligated to choose the lowest numerical bid. Clients may choose any provider based on portfolio, reviews, delivery speed, or custom message proposals.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="payments" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-sm font-bold">5</span>
                Payment Protection & Platform Fees
              </h2>
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  How 100% Payment Protection Works
                </div>
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  When a client hires a provider, the agreed project amount is held securely by Syncro. Funds are <strong>never</strong> released prematurely to the provider until the client reviews, tests, and confirms satisfaction with the completed delivery.
                </p>
              </div>

              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Platform Service Fees:</h3>
                <p>
                  To sustain platform infrastructure, customer support, and payment security, Syncro charges a standard <strong>5% platform fee</strong> on successfully completed and released milestones. Clients pay zero upfront listing fees.
                </p>
                <p>
                  All transactions and quotes on Syncro are listed in <strong>Sri Lankan Rupees (LKR)</strong>.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="circumvention" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-sm font-bold">6</span>
                Anti-Circumvention Policy
              </h2>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <strong>Protecting Your Payment:</strong> Transacting outside Syncro forfeits all Syncro Payment Protection, review verification, and dispute resolution guarantees.
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Users must not request or share direct bank account details, cash settlement promises, or off-platform payment methods prior to project confirmation. Attempting to evade platform fees or conduct fraudulent transactions will result in immediate account suspension.
              </p>
            </section>

            {/* Section 7 */}
            <section id="cancellations" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-sm font-bold">7</span>
                Cancellations, Revisions & Dispute Resolution
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                We believe in fair resolutions for both clients and hard-working Sri Lankan service professionals:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Inspection Window</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Clients have up to <strong>3 business days</strong> to review completed deliverables and either approve the release of funds or request reasonable revisions within the agreed scope.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Syncro Dispute Mediation</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    If an impasse occurs, either party may raise a dispute. Syncro support will review project messages, agreed milestones, and proof of work to issue a fair refund or payout determination.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="conduct" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-sm font-bold">8</span>
                Prohibited Activities
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                When using Syncro, you explicitly agree not to:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>Post illegal, hazardous, defamatory, or adult services prohibited under Sri Lankan law.</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>Submit artificial bids to manipulate reverse auction prices or sabotage competing providers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>Post fake reviews or coerce other users into giving 5-star ratings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>Scrape user directories or harvest contact details for unauthorized marketing.</span>
                </li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="ip" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-sm font-bold">9</span>
                Intellectual Property & Deliverables
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Upon full payment and fund release by the Client, the Provider transfers all agreed ownership rights and copyright of the custom work deliverables to the Client (unless both parties expressly agreed otherwise in writing).
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Providers retain the right to showcase publicly completed work in their Syncro portfolio strictly for promotional purposes, provided no confidential or proprietary client data is revealed.
              </p>
            </section>

            {/* Section 10 */}
            <section id="liability" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-sm font-bold">10</span>
                Disclaimers & Limitation of Liability
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Syncro provides the platform on an “as is” and “as available” basis. While we verify provider profiles and ensure payment safety protocols, Syncro does not warrant the quality, safety, or legality of services rendered by individual third-party providers.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                To the maximum extent permitted by Sri Lankan law, Syncro’s total aggregate liability arising from any transaction shall not exceed the platform fees retained by Syncro for that specific project.
              </p>
            </section>

            {/* Section 11 */}
            <section id="law" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-sm font-bold">11</span>
                Governing Law & Jurisdiction
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                These Terms shall be governed by, and construed in accordance with, the laws of the <strong>Democratic Socialist Republic of Sri Lanka</strong>, including the Electronic Transactions Act No. 19 of 2006.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Any legal dispute that cannot be resolved amicably via Syncro Mediation shall be subject to the exclusive jurisdiction of the competent courts of Sri Lanka.
              </p>
            </section>

            {/* Section 12 */}
            <section id="contact" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-sm font-bold">12</span>
                Contact & Support
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                If you have questions regarding these Terms or need assistance with an active dispute, please reach out to our legal and support team:
              </p>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-sm space-y-1 text-slate-700 dark:text-slate-300">
                <div><strong>Platform:</strong> Syncro Technologies (Private) Limited</div>
                <div><strong>Email:</strong> <a href="mailto:syncromarketplace@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">syncromarketplace@gmail.com</a></div>
                <div><strong>Location:</strong> Colombo, Western Province, Sri Lanka</div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
