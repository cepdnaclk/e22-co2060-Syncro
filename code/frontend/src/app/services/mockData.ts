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
export const buyerOrders: Order[] = [];

// Seller Orders
export const sellerOrders: Order[] = [];

// Services / Listings
export const mockServices: Service[] = [];

// Messages
export const mockMessages: Message[] = [];

// Recent Activities (Buyer Dashboard)
export const buyerActivities: Activity[] = [];

// Chart Data
export const revenueData: { month: string; revenue: number }[] = [];

export const orderData: { month: string; orders: number }[] = [];