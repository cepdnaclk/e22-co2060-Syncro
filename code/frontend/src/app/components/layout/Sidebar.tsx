import React from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Search,
  ShoppingCart,
  Wallet,
  MessageSquare,
  Settings,
  Package,
  TrendingUp,
  Star,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Sidebar() {
  const { role, businessProfile, hasSellerProfile } = useApp();
  const location = useLocation();

  const buyerNavItems = [
    { section: 'Overview', items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ]},
    { section: 'Marketplace', items: [
      { name: 'Discover Services', icon: Search, path: '/discover' },
    ]},
    { section: 'Transactions', items: [
      { name: 'My Orders', icon: ShoppingCart, path: '/orders' },
      { name: 'Payments / Wallet', icon: Wallet, path: '/payments' },
    ]},
    { section: 'Communication', items: [
      { name: 'Messages', icon: MessageSquare, path: '/messages' },
    ]},
    { section: 'Account', items: [
      { name: 'Settings', icon: Settings, path: '/settings' },
    ]},
  ];

  const sellerNavItems = [
    { section: 'Overview', items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ]},
    { section: 'Business', items: [
      { name: 'My Listings', icon: Package, path: '/listings' },
    ]},
    { section: 'Transactions', items: [
      { name: 'Orders Received', icon: ShoppingCart, path: '/orders-received' },
      { name: 'Earnings', icon: TrendingUp, path: '/earnings' },
    ]},
    { section: 'Communication', items: [
      { name: 'Messages', icon: MessageSquare, path: '/messages' },
    ]},
    { section: 'Account', items: [
      { name: 'Settings', icon: Settings, path: '/settings' },
    ]},
  ];

  const navItems = role === 'buyer' ? buyerNavItems : sellerNavItems;

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <nav className="p-4 space-y-6">
        {/* Business Identity Section - Seller Mode Only (and only if profile exists) */}
        {role === 'seller' && hasSellerProfile && businessProfile && (
          <div className="pb-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">{businessProfile.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{businessProfile.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {businessProfile.rating} ({businessProfile.reviewCount})
                  </span>
                </div>
              </div>
            </div>
            <Link 
              to="/settings" 
              className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Public Profile
            </Link>
          </div>
        )}

        {navItems.map((section) => (
          <div key={section.section}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}