import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Globe, MapPin, Upload, X, Star, Image as ImageIcon, Tag } from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useApp } from '../context/AppContext';
import { serviceCategories } from '../services/mockData';
import { useNavigate } from 'react-router';

// Demo gallery images for testing
const demoGalleryImages = [
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop',
];

export function SellerProfileSettings() {
  const navigate = useNavigate();
  const { businessProfile, setBusinessProfile, userProfile, setUserProfile } = useApp();

  const [formData, setFormData] = useState({
    // Personal
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    phone: userProfile.phone || '',
    // Business
    businessName: businessProfile?.name || '',
    businessEmail: businessProfile?.email || '',
    businessPhone: businessProfile?.phone || '',
    businessDescription: businessProfile?.description || '',
    website: businessProfile?.website || '',
    businessAddress: businessProfile?.address || '',
    category: businessProfile?.category || '',
  });

  const [gallery, setGallery] = useState<string[]>(businessProfile?.gallery || []);
  const [coverImage, setCoverImage] = useState<string>(businessProfile?.coverImage || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(businessProfile?.categories || []);
  const [serviceTags, setServiceTags] = useState<string[]>(businessProfile?.serviceTags || []);
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    // Update user profile
    setUserProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
    });

    if (businessProfile) {
      // Update business profile
      setBusinessProfile({
        ...businessProfile,
        name: formData.businessName,
        initials: formData.businessName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        email: formData.businessEmail,
        phone: formData.businessPhone,
        description: formData.businessDescription,
        website: formData.website,
        address: formData.businessAddress,
        category: formData.category,
        coverImage,
        gallery,
        categories: selectedCategories,
        serviceTags,
      });
    }
  };

  const handleAddGalleryImage = () => {
    // In production, this would open a file picker
    const mockImageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=800&h=600&fit=crop`;
    if (gallery.length < 8) {
      setGallery([...gallery, mockImageUrl]);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !serviceTags.includes(newTag.trim())) {
      setServiceTags([...serviceTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setServiceTags(serviceTags.filter(t => t !== tag));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Business Profile</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/seller/preview')}
            >
              View Public Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Cover Image */}
          <div>
            <label className="block mb-3 font-medium">Cover Image</label>
            <div className="relative h-48 bg-gradient-to-br from-primary via-primary to-accent rounded-xl overflow-hidden">
              {coverImage ? (
                <>
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setCoverImage('')}
                    className="absolute top-3 right-3 p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setCoverImage('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop')}
                  className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-black/10 transition-colors"
                >
                  <Upload className="w-8 h-8 text-white" />
                  <span className="text-white font-medium">Upload Cover Image</span>
                  <span className="text-white/80 text-sm">1200x400px recommended</span>
                </button>
              )}
            </div>
          </div>

          {/* Business Logo */}
          <div>
            <label className="block mb-3 font-medium">Business Logo</label>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-4xl">
                  {formData.businessName ? formData.businessName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'BN'}
                </span>
              </div>
              <div>
                <Button variant="outline" size="sm" className="mb-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-sm text-muted-foreground">Square image recommended. Max size 5MB</p>
              </div>
            </div>
          </div>

          {/* Business Gallery */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Business Gallery ({gallery.length}/8)
              </label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddGalleryImage}
                disabled={gallery.length >= 8}
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Showcase your work with 3-8 images
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {gallery.length === 0 && (
                <div className="col-span-2 md:col-span-4 p-12 border-2 border-dashed border-border rounded-lg text-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No images yet. Add your first gallery image.</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-6">
            <div>
              <label className="block mb-3 font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Business Information
              </label>
              <div className="grid gap-6">
                <Input
                  label="Company Name"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Your Business Name"
                />
                
                <div>
                  <label className="block mb-2 text-sm">Business Description</label>
                  <textarea
                    value={formData.businessDescription}
                    onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Describe your business, services, and what makes you unique..."
                  />
                </div>
              </div>
            </div>

            {/* What We Sell - Categories */}
            <div>
              <label className="block mb-3 font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" />
                What We Sell - Service Categories
              </label>
              <p className="text-sm text-muted-foreground mb-4">
                Select all categories that apply to your business
              </p>
              <div className="flex flex-wrap gap-2">
                {serviceCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedCategories.includes(category)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border hover:border-primary'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <div className="mt-4 p-4 bg-accent/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((cat) => (
                      <Badge key={cat} variant="secondary">{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Service Tags */}
            <div>
              <label className="block mb-3 font-medium">Service Tags</label>
              <p className="text-sm text-muted-foreground mb-4">
                Add specific services or skills (e.g., "Logo Design", "SEO", "React Development")
              </p>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a service tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button onClick={handleAddTag}>Add</Button>
              </div>
              {serviceTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {serviceTags.map((tag) => (
                    <Badge key={tag} className="gap-2">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Ratings Display (Read-only) */}
            <div className="p-6 bg-accent/30 rounded-lg border border-border">
              <label className="block mb-3 font-medium flex items-center gap-2">
                <Star className="w-4 h-4" />
                Your Ratings
              </label>
              <div className="flex items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(businessProfile?.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-2xl font-bold">{businessProfile?.rating.toFixed(1) || '0.0'}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{businessProfile?.reviewCount || 0} total reviews</p>
                  <p className="text-xs mt-1">Buyers leave reviews after completing orders</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <label className="block mb-3 font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Contact Information
              </label>
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Business Email"
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  placeholder="contact@business.com"
                />
                <Input
                  label="Business Phone"
                  value={formData.businessPhone}
                  onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
                <Input
                  label="Website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>

            {/* Business Address */}
            <div>
              <label className="block mb-3 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Business Address (Optional)
              </label>
              <Input
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                placeholder="123 Business St, City, State, ZIP"
              />
            </div>
          </div>

          {/* Personal Account Info */}
          <div className="pt-6 border-t border-border">
            <label className="block mb-4 font-medium">Account Owner Information</label>
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}