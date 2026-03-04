import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { Star, Clock, MapPin, CheckCircle, MessageSquare, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { mockServices } from '../services/mockData';

// Per-service features and packages — no longer hardcoded to logo design
const serviceExtras: Record<number, {
  features: string[];
  packages: { name: string; price: number; revisions: number | string; deliveryDays: number; features: string[] }[];
}> = {
  1: {
    features: ['Custom logo design', '3 initial concepts', 'Unlimited revisions', 'Vector files included', 'Copyright transfer', 'Brand guidelines document'],
    packages: [
      { name: 'Basic', price: 450, revisions: 3, deliveryDays: 5, features: ['1 logo concept', 'Basic files'] },
      { name: 'Standard', price: 750, revisions: 5, deliveryDays: 3, features: ['3 logo concepts', 'All file formats', 'Brand colors'] },
      { name: 'Premium', price: 1200, revisions: 'Unlimited', deliveryDays: 2, features: ['5 logo concepts', 'All file formats', 'Brand guidelines', 'Social media kit'] },
    ],
  },
  2: {
    features: ['Responsive frontend + REST API', 'Database design', 'Authentication & authorization', 'Deployment setup', 'Source code included', '30-day support'],
    packages: [
      { name: 'Basic', price: 2500, revisions: 2, deliveryDays: 21, features: ['Up to 5 pages', 'Basic backend', 'Deployment'] },
      { name: 'Standard', price: 4000, revisions: 4, deliveryDays: 14, features: ['Up to 15 pages', 'Full backend', 'Auth', 'Admin panel'] },
      { name: 'Premium', price: 7500, revisions: 'Unlimited', deliveryDays: 10, features: ['Unlimited pages', 'Microservices', 'CI/CD pipeline', '90-day support'] },
    ],
  },
  3: {
    features: ['Keyword research', 'On-page SEO audit', 'Content strategy', 'Backlink analysis', 'Monthly report', 'Google Analytics setup'],
    packages: [
      { name: 'Basic', price: 800, revisions: 1, deliveryDays: 7, features: ['SEO audit', 'Keyword report'] },
      { name: 'Standard', price: 1400, revisions: 3, deliveryDays: 5, features: ['Full audit', 'On-page fixes', 'Content plan'] },
      { name: 'Premium', price: 2500, revisions: 'Unlimited', deliveryDays: 3, features: ['Complete SEO overhaul', 'Backlinks', 'Monthly retainer'] },
    ],
  },
  4: {
    features: ['SEO-optimised copy', 'Multiple tone options', 'Unlimited revisions', 'Plagiarism-free guarantee', 'Meta descriptions', 'CTA integration'],
    packages: [
      { name: 'Basic', price: 350, revisions: 2, deliveryDays: 4, features: ['Up to 500 words', 'Website copy'] },
      { name: 'Standard', price: 600, revisions: 4, deliveryDays: 3, features: ['Up to 1,500 words', 'Ad copy included'] },
      { name: 'Premium', price: 1100, revisions: 'Unlimited', deliveryDays: 2, features: ['Up to 5,000 words', 'Full content package'] },
    ],
  },
  5: {
    features: ['Content calendar', 'Daily posting', 'Community management', 'Analytics report', 'Hashtag strategy', 'Story creation'],
    packages: [
      { name: 'Basic', price: 600, revisions: 1, deliveryDays: 30, features: ['12 posts/month', '2 platforms'] },
      { name: 'Standard', price: 1000, revisions: 2, deliveryDays: 30, features: ['20 posts/month', '4 platforms', 'Stories'] },
      { name: 'Premium', price: 1800, revisions: 'Unlimited', deliveryDays: 30, features: ['Daily posting', 'All platforms', 'Ad management'] },
    ],
  },
  6: {
    features: ['iOS & Android', 'React Native / Flutter', 'RESTful API integration', 'Push notifications', 'App Store submission', '60-day support'],
    packages: [
      { name: 'Basic', price: 5000, revisions: 2, deliveryDays: 42, features: ['MVP app', 'Core features', 'Single platform'] },
      { name: 'Standard', price: 8500, revisions: 4, deliveryDays: 30, features: ['Cross-platform', 'Backend included', 'Push notifications'] },
      { name: 'Premium', price: 14000, revisions: 'Unlimited', deliveryDays: 21, features: ['Full-featured app', 'Admin dashboard', 'Analytics', '90-day support'] },
    ],
  },
};

// Fallback in case a service id doesn't have extras
const defaultExtras = {
  features: ['Professional service', 'Experienced provider', 'Quality guaranteed', 'Timely delivery', 'Revision support'],
  packages: [
    { name: 'Basic', price: 99, revisions: 2, deliveryDays: 7, features: ['Core deliverable'] },
    { name: 'Standard', price: 199, revisions: 4, deliveryDays: 5, features: ['Core deliverable', 'Extras'] },
    { name: 'Premium', price: 399, revisions: 'Unlimited', deliveryDays: 3, features: ['Everything', 'Priority support'] },
  ],
};

export function ServiceDetail() {
  const { id } = useParams();
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(0);

  const serviceId = Number(id);
  // Get service data from mock data — fallback to first service if id not found
  const serviceData = mockServices.find(s => s.id === serviceId) || mockServices[0];
  const extras = serviceExtras[serviceData.id] ?? defaultExtras;

  const service = {
    ...serviceData,
    location: 'Remote',
    ...extras,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/discover" className="hover:text-primary">Discovery</Link>
        <span>/</span>
        <span className="text-foreground">{service.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-xl flex items-center justify-center">
                <span className="text-8xl opacity-20">{service.title.charAt(0).toUpperCase()}</span>
              </div>
              <CardContent className="p-8">
                <Badge variant="info" className="mb-4">{service.category}</Badge>
                <h1 className="text-3xl font-bold mb-4">{service.title}</h1>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{service.rating}</span>
                    <span className="text-muted-foreground">({service.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>{service.deliveryTime} delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5" />
                    <span>{service.location}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-3">About this service</h3>
                  <p className="text-muted-foreground mb-6">{service.description}</p>

                  <h3 className="font-semibold mb-3">What's included</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Packages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Choose a Package</h3>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {service.packages.map((pkg, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPackage(index)}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${selectedPackage === index
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <h4 className="font-semibold mb-2">{pkg.name}</h4>
                      <div className="text-2xl font-bold text-primary mb-3">${pkg.price}</div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>⏱️ {pkg.deliveryDays} days delivery</div>
                        <div>🔄 {pkg.revisions} revisions</div>
                        <div className="border-t border-border pt-2 mt-2">
                          {pkg.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-1 mb-1">
                              <CheckCircle className="w-3 h-3 mt-0.5 text-accent" />
                              <span className="text-xs">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-1">Selected Package</div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    ${service.packages[selectedPackage].price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {service.packages[selectedPackage].name} Package
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <Textarea
                    label="Order Notes (Optional)"
                    placeholder="Provide additional details or requirements..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <Link to="/order/confirmation">
                  <Button className="w-full mb-3">Place Order</Button>
                </Link>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>

                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-5 h-5 text-accent" />
                    <span className="text-muted-foreground">Secure payment protection</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span className="text-muted-foreground">Money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MessageSquare className="w-5 h-5 text-accent" />
                    <span className="text-muted-foreground">Direct communication</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Seller Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">About the Seller</h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {service.seller.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{service.seller}</div>
                    <div className="text-sm text-muted-foreground">Professional Seller</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-semibold">{service.rating} ⭐</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-semibold">1 hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Orders Completed</span>
                    <span className="font-semibold">{service.reviews}+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}