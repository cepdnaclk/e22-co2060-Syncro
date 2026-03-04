import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, Building2, Upload, Check, Sparkles } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useApp } from '../context/AppContext';

interface SellerOnboardingProps {
  onClose: () => void;
}

export function SellerOnboarding({ onClose }: SellerOnboardingProps) {
  const { setBusinessProfile, setRole } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    customCategory: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    logo: null as string | null,
  });

  const categories = [
    'Design & Creative',
    'Development & IT',
    'Marketing & Sales',
    'Writing & Content',
    'Business Services',
    'Consulting',
    'Other',
  ];

  const handleComplete = () => {
    // Create business profile
    const finalCategory = formData.category === 'Other' && formData.customCategory 
      ? formData.customCategory 
      : formData.category;
      
    const profile = {
      name: formData.businessName,
      initials: formData.businessName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      rating: 4.5,
      reviewCount: 0,
      email: formData.email,
      phone: formData.phone,
      description: formData.description,
      website: formData.website,
      address: formData.address,
      category: finalCategory,
      logo: formData.logo,
      coverImage: undefined,
      gallery: [],
      categories: [finalCategory],
      serviceTags: [],
      reviews: [],
    };

    setBusinessProfile(profile);
    setRole('seller');
    onClose();
  };

  const isStep2Valid = formData.businessName && formData.category && formData.description && formData.email && 
    (formData.category !== 'Other' || formData.customCategory);
  const isStep3Valid = true; // Optional fields

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="m-4">
          <CardContent className="p-0">
            {/* Progress Bar */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Become a Seller</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      step <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <Step1
                    key="step1"
                    onNext={() => setCurrentStep(2)}
                    onClose={onClose}
                  />
                )}
                {currentStep === 2 && (
                  <Step2
                    key="step2"
                    formData={formData}
                    setFormData={setFormData}
                    categories={categories}
                    onNext={() => setCurrentStep(3)}
                    onBack={() => setCurrentStep(1)}
                    isValid={isStep2Valid}
                  />
                )}
                {currentStep === 3 && (
                  <Step3
                    key="step3"
                    formData={formData}
                    setFormData={setFormData}
                    onNext={() => setCurrentStep(4)}
                    onBack={() => setCurrentStep(2)}
                  />
                )}
                {currentStep === 4 && (
                  <Step4
                    key="step4"
                    businessName={formData.businessName}
                    onComplete={handleComplete}
                  />
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function Step1({ onNext, onClose }: { onNext: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 text-center"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold mb-3">Start Selling on Syncro</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Join thousands of successful sellers and grow your business with our platform
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 py-8">
        {[
          { title: 'Reach More Buyers', desc: 'Connect with customers actively looking for your services' },
          { title: 'Secure Payments', desc: 'Get paid safely with our integrated payment system' },
          { title: 'Manage Orders', desc: 'Track and manage all your orders in one place' },
        ].map((benefit, index) => (
          <div key={index} className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">{benefit.title}</h4>
            <p className="text-sm text-muted-foreground">{benefit.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center pt-4">
        <Button variant="outline" onClick={onClose}>Not Now</Button>
        <Button onClick={onNext} className="min-w-[200px]">
          Create Business Profile
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function Step2({
  formData,
  setFormData,
  categories,
  onNext,
  onBack,
  isValid,
}: any) {
  const [dragActive, setDragActive] = useState(false);
  
  const businessInitials = formData.businessName
    ? formData.businessName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'BL';

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Business Basics</h3>
        <p className="text-muted-foreground">Tell us about your business</p>
      </div>

      <div className="space-y-8 max-w-xl mx-auto">
        {/* Business Logo Upload Section */}
        <div>
          <label className="block mb-3 text-sm font-medium">Business Logo</label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-accent/20'
            }`}
          >
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleLogoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {formData.logo ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-border">
                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-3xl">{businessInitials}</span>
              </div>
            )}
            
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Upload className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium">
                  {formData.logo ? 'Change Logo' : 'Upload Logo'}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: Square image, PNG or JPG, max 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Company Name */}
        <Input
          label="Company Name *"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          placeholder="Your Business Name"
        />

        {/* Business Category */}
        <div>
          <label className="block mb-2 text-sm font-medium">Business Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value, customCategory: '' })}
            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          >
            <option value="">Select a category</option>
            {categories.map((cat: string) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Conditional Custom Category Field */}
        <AnimatePresence>
          {formData.category === 'Other' && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Input
                label="Specify Business Category *"
                value={formData.customCategory}
                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                placeholder="Enter your business category"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Business Description */}
        <div>
          <label className="block mb-2 text-sm font-medium">Business Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
            placeholder="Describe your business, services, and what makes you unique..."
          />
        </div>

        {/* Business Email */}
        <Input
          label="Business Email *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="contact@business.com"
        />

        {/* Business Phone */}
        <Input
          label="Business Phone (Optional)"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="flex gap-3 justify-between pt-6 max-w-xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function Step3({ formData, setFormData, onNext, onBack }: any) {
  const businessInitials = formData.businessName
    ? formData.businessName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'BS';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Brand Setup</h3>
        <p className="text-muted-foreground">Add your branding and additional details</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="block mb-3 text-sm font-medium">Business Logo</label>
            <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-3xl">{businessInitials}</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium mb-1">Upload Logo</p>
                <p className="text-xs text-muted-foreground">Square image recommended</p>
              </div>
            </div>
          </div>

          <Input
            label="Website (Optional)"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://yourbusiness.com"
          />

          <Input
            label="Business Address (Optional)"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Business St, City, State, ZIP"
          />
        </div>

        {/* Live Preview */}
        <div>
          <label className="block mb-3 text-sm font-medium">Preview</label>
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-2xl">{businessInitials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg mb-1 truncate">
                    {formData.businessName || 'Your Business Name'}
                  </h4>
                  <p className="text-sm text-muted-foreground">{formData.category || 'Category'}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {formData.description || 'Your business description will appear here...'}
              </p>
              <div className="space-y-2 text-sm">
                {formData.email && (
                  <p className="text-muted-foreground">📧 {formData.email}</p>
                )}
                {formData.phone && (
                  <p className="text-muted-foreground">📱 {formData.phone}</p>
                )}
                {formData.website && (
                  <p className="text-primary truncate">🌐 {formData.website}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3 justify-between pt-6 max-w-4xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function Step4({ businessName, onComplete }: { businessName: string; onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 text-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto"
      >
        <Check className="w-12 h-12 text-white" />
      </motion.div>
      
      <div>
        <h2 className="text-3xl font-bold mb-3">You're Now a Seller!</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Congratulations! Your business profile for <span className="font-semibold text-foreground">{businessName}</span> has been created.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 max-w-xl mx-auto">
        <h4 className="font-semibold mb-3">Next Steps:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground text-left">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Create your first service listing to attract buyers</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Set up your payment methods to start receiving payments</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Complete your business profile for better visibility</span>
          </li>
        </ul>
      </div>

      <Button onClick={onComplete} size="lg" className="min-w-[250px]">
        Go to Seller Dashboard
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}