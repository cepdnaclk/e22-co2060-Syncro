import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { User, Bell, Shield, Moon, Sun, Monitor, Building2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { SellerProfileSettings } from '../components/SellerProfileSettings';
import { useSearchParams, useNavigate } from 'react-router';
import { authApi, profilesApi } from '../services/api';

type Tab = 'profile' | 'notifications' | 'appearance' | 'privacy' | 'business';

const baseTabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Moon },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
];

export function Settings() {
  const { theme, setTheme, userProfile, setUserProfile, role, hasSellerProfile, logout } = useApp();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const { url } = await profilesApi.uploadImage(file);
      setUserProfile({ ...userProfile, avatar: url });
    } catch (err: any) {
      alert('Photo upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setAvatarUploading(false);
      // Reset input so the same file can be re-selected
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await authApi.deleteAccount();
      logout();
      navigate('/register');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const param = searchParams.get('tab');
    if (param === 'business') return 'business';
    return 'profile';
  });

  // Keep tab in sync if URL param changes (e.g. from sidebar link)
  useEffect(() => {
    const param = searchParams.get('tab');
    if (param === 'business' && role === 'seller' && hasSellerProfile) {
      setActiveTab('business');
    }
  }, [searchParams, role, hasSellerProfile]);

  const tabs = [
    ...baseTabs,
    ...(role === 'seller' && hasSellerProfile
      ? [{ id: 'business' as Tab, label: 'Business Profile', icon: Building2 }]
      : []),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tab List */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent text-foreground'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* ── Business Profile ─────────────────────── */}
            {activeTab === 'business' && <SellerProfileSettings />}

            {/* ── Profile ─────────────────────────────── */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                  <p className="text-sm text-muted-foreground">Update your personal details</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    {userProfile.avatar ? (
                      <img
                        src={userProfile.avatar}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                          {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarUploading}
                      >
                        {avatarUploading ? 'Uploading...' : 'Change Photo'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, GIF or PNG. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      defaultValue={userProfile.firstName}
                    />
                    <Input
                      label="Last Name"
                      defaultValue={userProfile.lastName}
                    />
                  </div>
                  <Input
                    type="email"
                    label="Email"
                    defaultValue={userProfile.email}
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    placeholder="+1 (555) 000-0000"
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      rows={3}
                      defaultValue={userProfile.bio}
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <Button>Save Profile</Button>
                </CardContent>
              </Card>
            )}

            {/* ── Notifications ────────────────────────── */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Notification Preferences</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose what you want to be notified about
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Order Updates', desc: 'New orders, status changes, completions', defaultChecked: true },
                      { label: 'Messages', desc: 'New messages from buyers or sellers', defaultChecked: true },
                      { label: 'Payment Alerts', desc: 'Confirmations, refunds, and withdrawals', defaultChecked: true },
                      { label: 'Promotional Emails', desc: 'Tips, product updates, and offers', defaultChecked: false },
                      { label: 'Review Reminders', desc: 'Reminders to leave reviews for completed orders', defaultChecked: true },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-sm text-muted-foreground">{item.desc}</div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked={item.defaultChecked}
                          className="w-5 h-5 rounded accent-primary"
                        />
                      </div>
                    ))}
                  </div>
                  <Button className="mt-6">Save Preferences</Button>
                </CardContent>
              </Card>
            )}

            {/* ── Appearance ───────────────────────────── */}
            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Appearance</h2>
                  <p className="text-sm text-muted-foreground">Personalise how Syncro looks for you</p>
                </CardHeader>
                <CardContent>
                  <h3 className="font-medium mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'light', icon: Sun, label: 'Light' },
                      { value: 'dark', icon: Moon, label: 'Dark' },
                      { value: 'system', icon: Monitor, label: 'System' },
                    ].map((option) => {
                      const Icon = option.icon;
                      const isActive = theme === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value as 'light' | 'dark')}
                          className={`p-6 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${isActive
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <Icon className="w-8 h-8" />
                          <span className="text-sm font-medium">{option.label}</span>
                          {isActive && (
                            <Badge variant="default" className="text-xs">Active</Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Privacy & Security ───────────────────── */}
            {activeTab === 'privacy' && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Privacy &amp; Security</h2>
                  <p className="text-sm text-muted-foreground">Keep your account safe</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <Input type="password" label="Current Password" placeholder="••••••••" />
                      <Input type="password" label="New Password" placeholder="••••••••" />
                      <Input type="password" label="Confirm New Password" placeholder="••••••••" />
                    </div>
                    <Button className="mt-4">Update Password</Button>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    {!showDeleteConfirm ? (
                      <Button
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => { setShowDeleteConfirm(true); setDeleteError(null); }}
                      >
                        Delete Account
                      </Button>
                    ) : (
                      <div className="p-4 border border-destructive/40 rounded-lg bg-destructive/5 space-y-3">
                        <div className="flex items-center gap-2 text-destructive font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          Are you absolutely sure?
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This action cannot be undone. Your account and all associated data will be permanently deleted.
                        </p>
                        {deleteError && (
                          <p className="text-sm text-destructive">{deleteError}</p>
                        )}
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); }}
                            disabled={deleteLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading}
                          >
                            {deleteLoading ? 'Deleting...' : 'Yes, delete my account'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}