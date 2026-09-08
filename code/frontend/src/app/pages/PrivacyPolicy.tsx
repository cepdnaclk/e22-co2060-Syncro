import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  CheckCircle2, 
  FileText, 
  Printer, 
  ExternalLink,
  PhoneCall,
  MapPin,
  MessageSquare
} from 'lucide-react';

export function PrivacyPolicy() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: '1. Overview & Commitment' },
    { id: 'collection', title: '2. Information We Collect' },
    { id: 'usage', title: '3. How We Use Your Data' },
    { id: 'sharing', title: '4. Data Sharing & Disclosure' },
    { id: 'security', title: '5. Data Security & Storage' },
    { id: 'rights', title: '6. Your Rights (Sri Lanka PDPA)' },
    { id: 'cookies', title: '7. Cookies & Device Telemetry' },
    { id: 'retention', title: '8. Data Retention & Deletion' },
    { id: 'contact', title: '9. Data Protection Officer (DPO)' },
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
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 font-medium">
              Privacy & PDPA Compliance
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
              to="/terms"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Terms of Service <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Title */}
      <section className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#101321] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            Compliant with Sri Lanka PDPA Act No. 9 of 2022
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            At Syncro, your privacy is paramount. We believe in total transparency regarding what personal information we collect, how it empowers your local service matching, and how we keep it secure.
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
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 rounded-xl text-xs text-indigo-800 dark:text-indigo-300">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Zero Data Selling
                  </div>
                  We will never sell your personal contact info or data to third-party telemarketers.
                </div>
              </div>
            </div>
          </aside>

          {/* Policy Text Body */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-12 bg-white dark:bg-[#111322] p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm leading-relaxed text-sm sm:text-base">
            
            {/* Section 1 */}
            <section id="overview" className="scroll-mt-28 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center text-sm font-bold">1</span>
                Overview & Commitment to Privacy
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Syncro (“we”, “us”, or “our”) is committed to protecting the privacy and dignity of every individual who accesses our marketplace. This Privacy Policy governs our processing of personal data collected through the Syncro web application in compliance with the <strong>Personal Data Protection Act (PDPA) No. 9 of 2022 of Sri Lanka</strong>.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white">Plain English Summary:</strong> We only collect information necessary to help you hire pros, bid on projects, receive SMS/email updates, and keep your transactions safe.
              </div>
            </section>

            {/* Section 2 */}
            <section id="collection" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center text-sm font-bold">2</span>
                Information We Collect
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Depending on how you use Syncro (as a Client posting jobs or as a Service Provider bidding on them), we collect the following categories of data:
              </p>
              
              <div className="space-y-3 mt-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm mb-1">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    A. Account & Contact Information
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Your first name, last name, email address, password (stored via strong cryptographic hash), Sri Lankan mobile phone number (used for SMS OTP verification and important project alerts), and selected administrative district (e.g., Colombo, Kandy, Gampaha).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm mb-1">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    B. Project Requests & Bidding Data
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Service details you post (event dates, cake tiers, scope descriptions, attached photos or mockups), quote amounts submitted by providers, turnaround estimates, and status updates.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm mb-1">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    C. Direct Communications & Messages
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    In-app chats, file attachments, quotes, and milestone approvals exchanged between clients and providers for project execution and impartial dispute resolution.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm mb-1">
                    <Database className="w-4 h-4 text-indigo-600" />
                    D. Technical & Log Information
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    IP address, device type, browser settings, operating system, and preferred language (English, Sinhala, Tamil) to render the platform correctly.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="usage" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center text-sm font-bold">3</span>
                How We Use Your Data
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                We process your personal information strictly for legitimate, declared purposes:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Matching & Location Filtering:</strong> Connecting clients with verified providers situated near their district or willing to deliver island-wide.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Real-time Notifications:</strong> Sending essential alerts when bids are placed, projects are awarded, or milestones are approved.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Payment Protection & Safety:</strong> Facilitating secure payouts and mediating disputes between parties using authentic project records.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Fraud Prevention:</strong> Detecting duplicate accounts, bot spam, and fake review manipulation.</span>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="sharing" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center text-sm font-bold">4</span>
                Data Sharing & Disclosure
              </h2>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
                <strong>Our Guarantee:</strong> Syncro does not sell, rent, or trade your personal data with third-party advertisers or marketing data brokers.
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                We only share personal data in the following transparent scenarios:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm ml-2">
                <li><strong>Between Matched Users:</strong> Once an offer is accepted, the client and provider receive access to relevant communication and project requirements to complete the delivery.</li>
                <li><strong>Service Infrastructure Providers:</strong> Cloud hosting, database infrastructure, and SMS gateway providers (operating under strict confidentiality agreements).</li>
                <li><strong>Legal Compliance:</strong> When compelled by valid legal process or court order under Sri Lankan statutory authority.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="security" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center text-sm font-bold">5</span>
                Data Security & Storage
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                We implement robust technical and organizational measures to safeguard your information against unauthorized access, loss, or alteration:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center">
                  <Lock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <div className="font-bold text-slate-900 dark:text-white text-xs">TLS 1.3 Encryption</div>
                  <div className="text-[11px] text-slate-500">All data in transit is encrypted</div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center">
                  <Shield className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <div className="font-bold text-slate-900 dark:text-white text-xs">Salted Password Hashes</div>
                  <div className="text-[11px] text-slate-500">Passwords never stored in plaintext</div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center">
                  <Database className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                  <div className="font-bold text-slate-900 dark:text-white text-xs">Restricted Access</div>
                  <div className="text-[11px] text-slate-500">Role-based internal permissioning</div>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="rights" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center text-sm font-bold">6</span>
                Your Rights Under Sri Lanka PDPA
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Under the Personal Data Protection Act No. 9 of 2022, as a data subject in Sri Lanka, you enjoy statutory rights regarding your personal information:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <strong>Right of Access:</strong> You may request a copy of all personal information Syncro holds about you.
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <strong>Right to Rectification:</strong> You can update inaccurate profile names, contact numbers, or districts at any time via Settings.
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <strong>Right to Erasure:</strong> You can request account deactivation and deletion of your profile data.
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <strong>Right to Withdraw Consent:</strong> You may opt out of non-essential promotional communications.
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="cookies" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center text-sm font-bold">7</span>
                Cookies & Local Storage
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Syncro uses cookies and browser local storage strictly for essential functional operations:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm ml-2">
                <li>Remembering your logged-in authentication session token securely.</li>
                <li>Saving your preferred UI language (English, සිංහල, or தமிழ்).</li>
                <li>Remembering your theme preference (Light / Dark mode).</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="retention" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center text-sm font-bold">8</span>
                Data Retention & Deletion
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                We retain your personal data for as long as your account remains active. If you close your account, your personal identification is purged or permanently anonymized within 30 days, except where retention of financial transaction logs is required by Sri Lankan financial and tax record-keeping regulations.
              </p>
            </section>

            {/* Section 9 */}
            <section id="contact" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center text-sm font-bold">9</span>
                Data Protection Officer & Inquiries
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                To exercise your rights under the PDPA, request data deletion, or ask any privacy-related questions, please contact our Data Protection Officer:
              </p>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-sm space-y-1 text-slate-700 dark:text-slate-300">
                <div><strong>Data Protection Officer (DPO):</strong> Syncro Privacy Team</div>
                <div><strong>Email:</strong> <a href="mailto:syncromarketplace@gmail.com" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">syncromarketplace@gmail.com</a></div>
                <div><strong>Address:</strong> Syncro Technologies (Pvt) Ltd, Colombo, Sri Lanka</div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
