import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { Star, Clock, MapPin, CheckCircle, MessageSquare, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { mockServices } from '../services/mockData';

export function ServiceDetail() {
  const { id } = useParams();
  const [orderNotes, setOrderNotes] = useState('');

  // Get service data from mock data
  const serviceData = mockServices.find(s => s.id === Number(id)) || mockServices[0];
  
  const service = {
    ...serviceData,
    location: 'Remote',
    features: [
      'Custom logo design',
      '3 initial concepts',
      'Unlimited revisions',
      'Vector files included',
      'Copyright transfer',
      'Brand guidelines document',
    ],
    packages: [
      { name: 'Basic', price: 450, revisions: 3, deliveryDays: 5, features: ['1 logo concept', 'Basic files'] },
      { name: 'Standard', price: 750, revisions: 5, deliveryDays: 3, features: ['3 logo concepts', 'All file formats', 'Brand colors'] },
      { name: 'Premium', price: 1200, revisions: 'Unlimited', deliveryDays: 2, features: ['5 logo concepts', 'All file formats', 'Brand guidelines', 'Social media kit'] },
    ],
  };

  const [selectedPackage, setSelectedPackage] = useState(1);

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
                <span className="text-8xl opacity-20">D</span>
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
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        selectedPackage === index
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
                    <span className="text-white font-bold">DS</span>
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
                    <span className="font-semibold">450+</span>
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