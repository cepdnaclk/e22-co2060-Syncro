import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, Bell, Moon, Sun, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
export function TopNav() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { role, theme, setTheme, businessProfile, userProfile, authUser, logout, toggleRole, hasSellerAccount, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [roleToggling, setRoleToggling] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => { setTheme(theme === 'light' ? 'dark' : 'light'); };
  const handleLogout = () => { logout(); navigate('/login'); };

  const handleToggleRole = async (newRole: 'buyer' | 'seller') => {
    if (newRole === role || roleToggling) return;
    setRoleToggling(true);
    try { await toggleRole(); } catch (e) { console.error('Role toggle failed', e); } finally { setRoleToggling(false); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const firstInitial = authUser?.firstName?.[0] || userProfile.firstName?.[0] || '?';
  const userInitials = firstInitial.toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border backdrop-blur-sm bg-card/95">
      <div className="flex items-center justify-between px-6 h-16">
        <Link to="/" className="flex items-center">
          <img src="/dark_nobg.png" alt="Syncro Logo" className="w-16 h-16 rounded-xl object-contain" />
        </Link>

        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" placeholder={t('nav.searchPlaceholder')} className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {role === 'seller' && businessProfile && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border rounded-lg">
              {businessProfile.logo ? (
                <img src={businessProfile.logo} alt={businessProfile.name} className="w-6 h-6 rounded-md object-cover" />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{businessProfile.initials}</span>
                </div>
              )}
              <span className="text-sm font-medium">{businessProfile.name}</span>
            </div>
          )}

          {hasSellerAccount && (
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button onClick={() => handleToggleRole('buyer')} disabled={roleToggling} className={`px-4 py-1.5 rounded-md text-sm transition-all ${role === 'buyer' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'} ${roleToggling ? 'opacity-60 cursor-not-allowed' : ''}`}>
                {t('nav.buyer')}
              </button>
              <button onClick={() => handleToggleRole('seller')} disabled={roleToggling} className={`px-4 py-1.5 rounded-md text-sm transition-all ${role === 'seller' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'} ${roleToggling ? 'opacity-60 cursor-not-allowed' : ''}`}>
                {t('nav.seller')}
              </button>
            </div>
          )}

          <div className="relative" ref={notifRef}>
            <button onClick={() => { const opening = !showNotifications; setShowNotifications(opening); setShowProfileMenu(false); if (opening) markAllNotificationsRead(); }} className="relative p-2 hover:bg-accent rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-border"><h3 className="font-semibold">{t('nav.notifications')}</h3></div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">{t('nav.noNotifications')}</div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} onClick={() => { if (!notif.is_read) markNotificationRead(notif.id); if (notif.reference_id) navigate('/bids'); }} className={`p-4 border-b border-border hover:bg-accent/50 cursor-pointer ${!notif.is_read ? 'bg-primary/5' : ''}`}>
                          <p className="text-sm">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          <button onClick={toggleTheme} className="p-2 hover:bg-accent rounded-lg transition-colors">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <div className="relative" ref={profileRef}>
            <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }} className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg transition-colors">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-border" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center" title={authUser?.firstName || userProfile.firstName}>
                  <span className="text-white text-sm font-semibold">{userInitials}</span>
                </div>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  <Link to="/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors">
                    <Settings className="w-4 h-4" /><span className="text-sm">{t('nav.settings')}</span>
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors border-t border-border text-left">
                    <LogOut className="w-4 h-4" /><span className="text-sm">{t('nav.logout')}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
