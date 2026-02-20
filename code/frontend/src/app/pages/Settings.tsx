import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Bell, Shield, CreditCard, Moon, Sun } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { SellerProfileSettings } from '../components/SellerProfileSettings';

export function Settings() {
  const { theme, setTheme } = useApp();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="lg:col-span-9">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'payments' && <PaymentSettings />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { role, userProfile, setUserProfile } = useApp();
  
  // Buyer profile data - initialize from context
  const [buyerFormData, setBuyerFormData] = useState({
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    phone: userProfile.phone || '',
  });

  const handleSaveBuyerProfile = () => {
    setUserProfile({
      firstName: buyerFormData.firstName,
      lastName: buyerFormData.lastName,
      email: buyerFormData.email,
      phone: buyerFormData.phone,
    });
  };

  if (role === 'buyer') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {buyerFormData.firstName[0] + buyerFormData.lastName[0]}
                </span>
              </div>
              <div>
                <Button variant="outline" size="sm" className="mb-2">Change Photo</Button>
                <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 5MB</p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                value={buyerFormData.firstName}
                onChange={(e) => setBuyerFormData({ ...buyerFormData, firstName: e.target.value })}
              />
              <Input
                label="Last Name"
                value={buyerFormData.lastName}
                onChange={(e) => setBuyerFormData({ ...buyerFormData, lastName: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={buyerFormData.email}
                onChange={(e) => setBuyerFormData({ ...buyerFormData, email: e.target.value })}
              />
              <Input
                label="Phone"
                value={buyerFormData.phone}
                onChange={(e) => setBuyerFormData({ ...buyerFormData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveBuyerProfile}>Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Seller Business Profile - Use comprehensive component
  return <SellerProfileSettings />;
}

function NotificationSettings() {
  const { theme, setTheme } = useApp();
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    newMessages: true,
    paymentConfirmations: true,
    marketingEmails: false,
    weeklyDigest: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Appearance</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Theme</h4>
              <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
            </div>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-md transition-all ${
                  theme === 'light' ? 'bg-card shadow-sm' : ''
                }`}
              >
                <Sun className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-md transition-all ${
                  theme === 'dark' ? 'bg-card shadow-sm' : ''
                }`}
              >
                <Moon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Email Notifications</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <h4 className="font-semibold capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SecuritySettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Change Password</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm New Password" type="password" />
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Add an extra layer of security to your account
          </p>
          <Button variant="outline">Enable 2FA</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PaymentSettings() {
  const savedCards = [
    { id: 1, brand: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 2, brand: 'Mastercard', last4: '5555', expiry: '08/26', isDefault: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payment Methods</h2>
            <Button variant="outline" size="sm">Add New Card</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {savedCards.map((card) => (
            <div key={card.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-br from-primary to-accent rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{card.brand}</span>
                </div>
                <div>
                  <div className="font-semibold">•••• {card.last4}</div>
                  <div className="text-sm text-muted-foreground">Expires {card.expiry}</div>
                </div>
                {card.isDefault && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">Default</span>
                )}
              </div>
              <Button variant="ghost" size="sm">Remove</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}