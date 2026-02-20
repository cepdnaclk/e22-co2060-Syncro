// Mock Data Layer - Centralized mock data for the application
// This file will be replaced with real API calls during backend integration

export interface Order {
  id: string;
  service: string;
  seller?: string;
  sellerId?: string;
  buyer?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  amount: number;
  hasReview?: boolean;
}

export interface Service {
  id: number;
  title: string;
  seller: string;
  rating: number;
  reviews: number;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  deliveryTime: string;
}

export interface Message {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  avatar: string;
}

export interface Activity {
  text: string;
  time: string;
  type: 'success' | 'info' | 'default';
}

// Service categories available
export const serviceCategories = [
  'Design & Creative',
  'Development & IT',
  'Marketing & Sales',
  'Writing & Content',
  'Business Consulting',
  'Video & Animation',
  'Music & Audio',
  'Photography',
  'Data & Analytics',
  'Legal & Compliance',
];

// Buyer Orders
export const buyerOrders: Order[] = [
  { id: 'ORD-001', service: 'Logo Design', seller: 'Design Studio Pro', sellerId: 'seller-1', status: 'in-progress', amount: 450 },
  { id: 'ORD-002', service: 'Website Development', seller: 'WebCraft Inc', sellerId: 'seller-2', status: 'pending', amount: 1200 },
  { id: 'ORD-003', service: 'Content Writing', seller: 'WordSmith Co', sellerId: 'seller-3', status: 'completed', amount: 300, hasReview: false },
  { id: 'ORD-004', service: 'SEO Optimization', seller: 'SEO Masters', sellerId: 'seller-4', status: 'in-progress', amount: 600 },
];

// Seller Orders
export const sellerOrders: Order[] = [
  { id: 'ORD-005', service: 'Brand Identity Package', buyer: 'Tech Startup Ltd', status: 'in-progress', amount: 850 },
  { id: 'ORD-006', service: 'Mobile App Design', buyer: 'Innovation Co', status: 'completed', amount: 1500 },
  { id: 'ORD-007', service: 'Marketing Campaign', buyer: 'Retail Group', status: 'pending', amount: 2200 },
  { id: 'ORD-008', service: 'Social Media Graphics', buyer: 'Fashion Brand', status: 'in-progress', amount: 450 },
];

// Services / Listings
export const mockServices: Service[] = [
  {
    id: 1,
    title: 'Professional Logo Design',
    seller: 'Design Studio Pro',
    rating: 4.9,
    reviews: 127,
    price: 450,
    category: 'Design & Creative',
    description: 'Custom logo design with unlimited revisions',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop',
    deliveryTime: '3-5 days',
  },
  {
    id: 2,
    title: 'Full Stack Web Development',
    seller: 'WebCraft Inc',
    rating: 5.0,
    reviews: 89,
    price: 2500,
    category: 'Development & IT',
    description: 'Complete web application development',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
    deliveryTime: '2-3 weeks',
  },
  {
    id: 3,
    title: 'SEO & Content Marketing',
    seller: 'SEO Masters',
    rating: 4.8,
    reviews: 156,
    price: 800,
    category: 'Marketing & Sales',
    description: 'Complete SEO optimization and content strategy',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    deliveryTime: '1 week',
  },
  {
    id: 4,
    title: 'Professional Copywriting',
    seller: 'WordSmith Co',
    rating: 4.7,
    reviews: 94,
    price: 350,
    category: 'Writing & Content',
    description: 'Engaging copy for websites, ads, and more',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
    deliveryTime: '2-4 days',
  },
  {
    id: 5,
    title: 'Social Media Management',
    seller: 'Social Boost',
    rating: 4.6,
    reviews: 203,
    price: 600,
    category: 'Marketing & Sales',
    description: 'Complete social media strategy and management',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
    deliveryTime: 'Monthly',
  },
  {
    id: 6,
    title: 'Mobile App Development',
    seller: 'App Innovations',
    rating: 4.9,
    reviews: 67,
    price: 5000,
    category: 'Development & IT',
    description: 'iOS and Android app development',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
    deliveryTime: '4-6 weeks',
  },
];

// Messages
export const mockMessages: Message[] = [
  {
    id: 1,
    name: 'Design Studio Pro',
    lastMessage: "Thanks! I'll send you the final files soon",
    timestamp: '2 min ago',
    unread: true,
    avatar: 'DS',
  },
  {
    id: 2,
    name: 'WebCraft Inc',
    lastMessage: 'The project is looking great!',
    timestamp: '1 hour ago',
    unread: true,
    avatar: 'WC',
  },
  {
    id: 3,
    name: 'SEO Masters',
    lastMessage: "I've completed the keyword research",
    timestamp: '3 hours ago',
    unread: false,
    avatar: 'SM',
  },
  {
    id: 4,
    name: 'WordSmith Co',
    lastMessage: 'When do you need the content?',
    timestamp: '1 day ago',
    unread: false,
    avatar: 'WS',
  },
  {
    id: 5,
    name: 'Tech Startup Ltd',
    lastMessage: 'Can we schedule a call?',
    timestamp: '2 days ago',
    unread: false,
    avatar: 'TS',
  },
];

// Recent Activities (Buyer Dashboard)
export const buyerActivities: Activity[] = [
  { text: 'Payment confirmed for Logo Design', time: '2 hours ago', type: 'success' },
  { text: 'New message from WebCraft Inc', time: '5 hours ago', type: 'info' },
  { text: 'Order #ORD-004 status updated', time: '1 day ago', type: 'default' },
  { text: 'Review submitted for SEO Masters', time: '2 days ago', type: 'default' },
];

// Chart Data
export const revenueData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 5100 },
  { month: 'Mar', revenue: 6800 },
  { month: 'Apr', revenue: 7200 },
  { month: 'May', revenue: 8500 },
  { month: 'Jun', revenue: 9200 },
];

export const orderData = [
  { month: 'Jan', orders: 12 },
  { month: 'Feb', orders: 19 },
  { month: 'Mar', orders: 15 },
  { month: 'Apr', orders: 25 },
  { month: 'May', orders: 22 },
  { month: 'Jun', orders: 30 },
];