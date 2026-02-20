import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Star, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router';
import { mockServices, serviceCategories } from '../services/mockData';

// All available categories including "All" option
const allCategories = ['All Categories', ...serviceCategories];

export function Discovery() {
  const [searchQuery, setSearchQuery] = useState('');
  // Fixed: initial value is 'all' and option values match
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Fixed: filters and sorts are now actually applied
  const filteredServices = useMemo(() => {
    let result = mockServices.map(service => ({
      ...service,
      location: 'Remote',
      image: service.imageUrl,
    }));

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.seller.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category === selectedCategory);
    }

    // Apply sort
    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        result = [...result].sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        // relevance — keep original order
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Discover Services</h1>
        <p className="text-muted-foreground">Find the perfect service provider for your needs</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-12 gap-4">
            {/* Search */}
            <div className="lg:col-span-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Category Filter — Fixed: option values now consistent with state */}
            <div className="lg:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Categories</option>
                {serviceCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="relevance">Most Relevant</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
      </p>

      {/* Results */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold mb-1">No services found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/service/${service.id}`}>
                <Card hover className="h-full flex flex-col">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-xl flex items-center justify-center">
                    <span className="text-4xl opacity-20">{service.title.charAt(0).toUpperCase()}</span>
                  </div>
                  <CardContent className="p-6 flex-1">
                    <Badge variant="info" className="mb-3">{service.category}</Badge>
                    <h3 className="font-semibold mb-2 line-clamp-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{service.seller}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-foreground">{service.rating}</span>
                        <span>({service.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.deliveryTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{service.location}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-muted-foreground">Starting at</span>
                      <div className="text-2xl font-bold text-primary">${service.price}</div>
                    </div>
                    <Button variant="outline">View Details</Button>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}