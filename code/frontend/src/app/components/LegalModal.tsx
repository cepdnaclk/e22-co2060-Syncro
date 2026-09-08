import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/Button';
import { ShieldCheck, Scale, ExternalLink, Check } from 'lucide-react';
import { Link } from 'react-router';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'terms' | 'privacy';
  onAccept?: () => void;
}

export function LegalModal({ isOpen, onClose, defaultTab = 'terms', onAccept }: LegalModalProps) {
  const [tab, setTab] = useState<'terms' | 'privacy'>(defaultTab);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#101321] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
        
        {/* Header with Tab Switcher */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#141829]/70">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {tab === 'terms' ? (
                  <>
                    <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Terms of Service
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Privacy Policy
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Syncro Reverse-Auction Marketplace • Democratic Socialist Republic of Sri Lanka
              </DialogDescription>
            </div>

            <Link
              to={tab === 'terms' ? '/terms' : '/privacy'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 flex-shrink-0"
            >
              Open Full Page <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('terms')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === 'terms'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setTab('privacy')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === 'privacy'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Privacy Policy
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed divide-y divide-slate-100 dark:divide-slate-800/60">
          {tab === 'terms' ? (
            <>
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">1. Platform Nature</h4>
                <p>
                  Syncro is an intermediary technology marketplace connecting clients with independent Sri Lankan service providers and small businesses. Syncro is not an employer or direct provider of catering, photography, tutoring, or technical services.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">2. Reverse Auction & Bidding</h4>
                <p>
                  Clients post project requirements for free. Independent providers submit competitive bids. Clients may choose any provider based on price, reviews, portfolio, or delivery timeframe.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">3. 100% Payment Protection</h4>
                <p>
                  Client payments are held securely by Syncro upon hiring and are only released to the service provider after the client inspects and approves the completed work. Syncro deducts a transparent 5% platform fee on successfully released payouts.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">4. Anti-Circumvention Policy</h4>
                <p>
                  Transactions must remain on the Syncro platform to ensure safety and qualify for Payment Protection and dispute mediation. Users are strictly prohibited from conducting off-platform cash deals before project confirmation.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">5. Dispute Resolution & Governing Law</h4>
                <p>
                  In the event of an unresolved dispute, Syncro provides impartial mediation based on project records and delivery proof. These Terms are governed under the laws of the Democratic Socialist Republic of Sri Lanka.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">1. Sri Lanka PDPA Compliance</h4>
                <p>
                  Syncro collects and processes your personal data in full compliance with the Personal Data Protection Act (PDPA) No. 9 of 2022 of Sri Lanka.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">2. Data We Collect</h4>
                <p>
                  We collect your name, email address, mobile phone number, district, project specifications, in-app messages, and transaction records needed to facilitate local service matching and reverse auction bidding.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">3. Zero Data Selling Guarantee</h4>
                <p>
                  We never sell, rent, or trade your personal telephone numbers or emails to third-party advertisers or marketing agencies. Data is shared strictly between matched parties to fulfill jobs.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">4. Security & Encryption</h4>
                <p>
                  Passwords are cryptographically salted and hashed. Communications and data in transit are protected using TLS 1.3 encryption.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">5. Your Statutory Rights</h4>
                <p>
                  You retain the right to access, rectify, or request the deletion of your personal data at any time by contacting our Data Protection Officer at syncromarketplace@gmail.com.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#141829]/50 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>

          {onAccept && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              I Agree & Continue
            </Button>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
