import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Star, MapPin, Globe, Mail, Phone, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { Review } from '../context/AppContext';

export function PublicSellerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businessProfile } = useApp();

  // In a real app, this would fetch the seller by ID
  // For now, we'll use the current business profile as demo
  const seller = businessProfile;

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Seller Not Found</h1>
          <p className="text-muted-foreground mb-6">This seller profile doesn't exist</p>
          <Button onClick={() => navigate('/discover')}>Browse Services</Button>
        </div>
      </div>
    );
  }

  const mockListings = [
    {
      id: 1,
      title: 'Premium Logo Design Package',
      price: 450,
      category: 'Design & Creative',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      title: 'Brand Identity Development',
      price: 850,
      category: 'Design & Creative',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      title: 'Social Media Graphics Pack',
      price: 300,
      category: 'Design & Creative',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="relative h-80 bg-gradient-to-br from-primary via-primary to-accent">
        {seller.coverImage && (
          <img 
            src={seller.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-3 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-card transition-colors shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10 pb-12">
        {/* Profile Header Card */}
        <Card className="mb-8 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-40 h-40 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl border-4 border-card">
                  {seller.logo ? (
                    <img src={seller.logo} alt={seller.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-white font-bold text-5xl">{seller.initials}</span>
                  )}
                </div>
              </div>

              {/* Business Info */}
              <div className="flex-grow">
                <h1 className="text-4xl font-bold mb-3">{seller.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(seller.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-lg">{seller.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({seller.reviewCount} {seller.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>

                {/* Categories */}
                {seller.categories && seller.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {seller.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Description */}
                {seller.description && (
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {seller.description}
                  </p>
                )}

                {/* Contact Info */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {seller.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{seller.address}</span>
                    </div>
                  )}
                  {seller.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <a href={seller.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">
                        {seller.website}
                      </a>
                    </div>
                  )}
                  {seller.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{seller.email}</span>
                    </div>
                  )}
                  {seller.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{seller.phone}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button size="lg" className="gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Seller
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        {seller.gallery && seller.gallery.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Portfolio Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {seller.gallery.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-lg overflow-hidden shadow-lg cursor-pointer"
                >
                  <img 
                    src={image} 
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Services/Listings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6">Services Offered</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={listing.image} 
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-3">
                    {listing.category}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-3">{listing.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ${listing.price.toLocaleString()}
                    </span>
                    <Button size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="space-y-4">
            {seller.reviews && seller.reviews.length > 0 ? (
              seller.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">{review.buyerInitials}</span>
          </div>

          {/* Review Content */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{review.buyerName}</h4>
              <span className="text-sm text-muted-foreground">{review.date}</span>
            </div>
            
            {/* Stars */}
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
