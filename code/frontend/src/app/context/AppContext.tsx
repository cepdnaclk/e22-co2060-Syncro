import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authApi } from '../services/api';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

type UserRole = 'buyer' | 'seller';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  buyerName: string;
  buyerInitials: string;
  date: string;
  orderId: string;
}

interface BusinessProfile {
  name: string;
  initials: string;
  rating: number;
  reviewCount: number;
  email?: string;
  phone?: string;
  description?: string;
  website?: string;
  address?: string;
  category?: string;
  logo?: string;
  coverImage?: string;
  gallery?: string[];
  categories?: string[];
  serviceTags?: string[];
  reviews?: Review[];
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  location?: string;
}

// Authenticated user info from JWT response
interface AuthUser {
  userId: number;
  email: string;
  firstName: string;
  role: string;
  token: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: string;
  setTheme: (theme: string) => void;
  businessProfile: BusinessProfile | null;
  setBusinessProfile: (profile: BusinessProfile) => void;
  hasSellerProfile: boolean;
  hasSellerAccount: boolean;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  // Real auth state
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, location: string, phone: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  toggleRole: () => Promise<void>;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  notifications: any[];
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  // Global unread message count — shown as badge on Messages nav / floating button
  unreadMessageCount: number;
  clearUnreadMessages: () => void;
  // Subscribe to a socket event from any page component.
  // Returns an unsubscribe function — call it in useEffect cleanup.
  socketOn: (event: string, handler: (data: any) => void) => () => void;
  // Emit a socket event from any page component.
  socketEmit: (event: string, data?: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER_PROFILE: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
};

// Load auth user from localStorage on startup
function loadAuthUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem('syncro_auth_user');
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUserState] = useState<AuthUser | null>(loadAuthUser);

  const [role, setRoleState] = useState<UserRole>(() => {
    const stored = localStorage.getItem('syncro_role');
    return (stored === 'buyer' || stored === 'seller') ? stored : 'buyer';
  });

  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('syncro_userProfile');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return DEFAULT_USER_PROFILE;
  });

  const [businessProfile, setBusinessProfileState] = useState<BusinessProfile | null>(() => {
    try {
      const stored = localStorage.getItem('syncro_businessProfile');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return null;
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const hasSellerProfile = businessProfile !== null;

  // Persistent flag: stays true once the user has ever been a seller (even in buyer mode).
  // Cleared only on logout so the role toggle remains visible when in buyer mode.
  const [hasSellerAccount, setHasSellerAccountState] = useState(() => {
    return localStorage.getItem('syncro_seller_account') === 'true';
  });

  const setHasSellerAccount = (val: boolean) => {
    setHasSellerAccountState(val);
    if (val) localStorage.setItem('syncro_seller_account', 'true');
    else localStorage.removeItem('syncro_seller_account');
  };

  // Whenever businessProfile is set (onboarding complete), mark the account as seller-capable
  useEffect(() => {
    if (businessProfile) setHasSellerAccount(true);
  }, [businessProfile]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  // Global unread message badge — incremented by socket, cleared when user opens /messages
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const clearUnreadMessages = useCallback(() => setUnreadMessageCount(0), []);

  // Holds the live socket so pages can subscribe without creating their own connection
  const socketRef = useRef<Socket | null>(null);

  // Persistent handler registry: event -> Set<handler>
  // Handlers registered via socketOn() are stored here and re-attached on every
  // socket reconnect, so real-time messages are never silently dropped.
  const handlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  // Pages call socketOn(event, handler) in a useEffect and return the unsubscribe fn.
  // Handlers survive socket reconnects because they're stored in handlersRef and
  // re-attached on every 'connect' event inside the socket useEffect below.
  const socketOn = useCallback((event: string, handler: (data: any) => void) => {
    // Register in persistent map
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);

    // Attach to socket if it's already connected
    if (socketRef.current) socketRef.current.on(event, handler);

    return () => {
      // Detach from socket
      if (socketRef.current) socketRef.current.off(event, handler);
      // Remove from persistent map
      handlersRef.current.get(event)?.delete(handler);
    };
  }, []); // stable — handlersRef and socketRef are refs

  // Emit an event on the shared socket.
  const socketEmit = useCallback((event: string, data?: any) => {
    if (socketRef.current) socketRef.current.emit(event, data);
  }, []);

  const isAuthenticated = authUser !== null;

  // Sync auth user to localStorage
  const setAuthUser = (user: AuthUser | null) => {
    setAuthUserState(user);
    if (user) {
      localStorage.setItem('syncro_auth_user', JSON.stringify(user));
      localStorage.setItem('syncro_token', user.token);
      localStorage.setItem('syncro_auth', 'true'); // keep ProtectedRoute compat
    } else {
      localStorage.removeItem('syncro_auth_user');
      localStorage.removeItem('syncro_token');
      localStorage.removeItem('syncro_auth');
    }
  };

  // Real login — calls backend
  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    const user: AuthUser = {
      userId: data.user_id,
      email,
      firstName: data.first_name,
      role: data.role,
      token: data.access_token,
    };

    // Set token in localStorage immediately so subsequent requests work
    localStorage.setItem('syncro_token', user.token);

    setAuthUser(user);
    const newRole = data.role === 'seller' ? 'seller' : 'buyer';
    setRoleState(newRole);
    localStorage.setItem('syncro_role', newRole);
    // Seed the user profile from backend response
    setUserProfileState(prev => ({ ...prev, firstName: data.first_name, email }));

    // Fetch full user details (including location) after token is set
    try {
      const me = await authApi.getMe();
      setUserProfileState(prev => ({
        ...prev,
        firstName: me.first_name || data.first_name,
        lastName: me.last_name || '',
        email: me.email,
        location: me.location || '',
        phone: me.phone_number || prev.phone || '',
      }));
    } catch { /* ignore — profile still usable without location */ }

    if (data.role === 'seller') {
      setHasSellerAccount(true);
    }

    // Try to fetch seller profile to restore seller toggle state
    try {
      // Must use profilesApi from the imported module (already added to top of file)
      const { profilesApi } = await import('../services/api');
      const profile = await profilesApi.get(data.user_id);
      
      // A user is only considered to have a seller account if they completed onboarding.
      // We require BOTH a non-empty description AND a profile name that differs from the
      // user's personal "First Last" name — onboarding always sets a distinct business name.
      // This prevents a buyer's personal bio (stored only in localStorage) from ever
      // triggering seller mode if it accidentally ends up in profile.description.
      const personalName = `${data.first_name || ''} ${profile?.name?.split(' ')[1] || ''}`.trim().toLowerCase();
      const profileName  = (profile?.name || '').trim().toLowerCase();
      const hasCustomBusinessName = profileName !== '' && profileName !== personalName;

      if (profile && profile.description && profile.description.trim() !== '' && hasCustomBusinessName) {
        setHasSellerAccount(true);
        setBusinessProfileState({
          name: profile.name,
          initials: profile.name.substring(0, 2).toUpperCase(),
          rating: 0,
          reviewCount: 0,
          description: profile.description,
          logo: profile.logo,
          coverImage: profile.cover_image,
        });
      }
    } catch (e) {
      // Ignore errors (user likely doesn't have a seller profile yet)
    }
  };

  // Real register — calls backend. It now returns a success message, but we DON'T log the user in yet.
  const register = async (email: string, password: string, firstName: string, lastName: string, location: string, phone: string) => {
    await authApi.register({ email, password, first_name: firstName, last_name: lastName, location, phone_number: phone });
    // Note: We do NOT set authUser here anymore. The user must verify their email first.
  };

  const verifyEmail = async (email: string, otp: string) => {
    const data = await authApi.verifyEmail({ email, otp });
    const user: AuthUser = {
      userId: data.user_id,
      email,
      firstName: data.first_name,
      role: data.role,
      token: data.access_token,
    };
    
    // Log the user in just like login()
    localStorage.setItem('syncro_token', user.token);
    setAuthUser(user);
    const newRole = data.role === 'seller' ? 'seller' : 'buyer';
    setRoleState(newRole);
    localStorage.setItem('syncro_role', newRole);
    
    try {
      const me = await authApi.getMe();
      setUserProfileState(prev => ({
        ...prev,
        firstName: me.first_name || data.first_name,
        lastName: me.last_name || '',
        email: me.email,
        location: me.location || '',
        phone: me.phone_number || prev.phone || '',
      }));
    } catch { /* ignore */ }

    if (data.role === 'seller') {
      setHasSellerAccount(true);
    }
  };

  // Logout — clear all auth state
  const logout = () => {
    setAuthUser(null);
    setRoleState('buyer');
    setBusinessProfileState(null);
    setHasSellerAccount(false);
    setNotifications([]);
    localStorage.removeItem('syncro_role');
    localStorage.removeItem('syncro_businessProfile');
    localStorage.removeItem('syncro_userProfile');
  };

  // Toggle role — calls backend and updates token
  const toggleRole = async () => {
    if (!authUser) return;
    const data = await authApi.toggleRole();
    const newRole = data.active_role === 'seller' ? 'seller' : 'buyer';
    setRoleState(newRole);
    localStorage.setItem('syncro_role', newRole);
    // Mark as seller-capable the first time they successfully switch to seller
    if (newRole === 'seller') setHasSellerAccount(true);
    // Update stored token with the new one
    const updatedUser: AuthUser = { ...authUser, role: newRole, token: data.access_token };
    setAuthUser(updatedUser);
  };

  // ── Effect 1: Fetch notification history whenever auth state changes ─────────
  // Re-runs on login and on role toggle (new token) to always show latest list.
  useEffect(() => {
    if (!authUser) return;

    const fetchNotifs = async () => {
      try {
        const { notificationsApi } = await import('../services/api');
        const data = await notificationsApi.getAll();
        setNotifications(data);
        // Do NOT toast pre-existing unread notifications here — that would
        // spam the user with old alerts on every login or role switch.
        // Real-time toasts are handled by the socket listener below.
      } catch (e) {
        console.error('Failed to fetch notifications', e);
      }
    };
    fetchNotifs();
  }, [authUser]);

  // ── Effect 1b: Hydrate location from backend on every session start ───────────
  // When a session is restored from localStorage the userProfile may not have
  // a location (e.g. sessions that pre-date the location feature, or the field
  // was not yet persisted). We always re-fetch /auth/me so the district the user
  // selected at sign-up is reliably shown in their profile settings.
  useEffect(() => {
    if (!authUser) return;
    const syncLocation = async () => {
      try {
        const me = await authApi.getMe();
        if (me.location) {
          setUserProfileState(prev => ({
            ...prev,
            location: me.location ?? prev.location,
          }));
        }
      } catch { /* silent — UI still functional without location */ }
    };
    syncLocation();
  }, [authUser?.userId]);

  // ── Effect 2: Socket.IO connection — only reconnect when userId changes ──────
  // Keyed on userId so a role toggle (which changes authUser but NOT userId)
  // does NOT tear down and rebuild the connection unnecessarily.
  useEffect(() => {
    const userId = authUser?.userId;
    if (!userId) return;

    const socket: Socket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
      transports: ['websocket']
    });
    socketRef.current = socket; // expose to pages via socketOn()

    socket.on('connect', () => {
      // Join the personal room so the backend can target this user
      socket.emit('identify', { userId });
      console.log(`[Socket] Connected and identified as user ${userId}`);

      // Re-attach all handlers registered via socketOn() so they survive reconnects.
      // This is the critical fix: without this, any handler registered before a
      // disconnect event is silently lost and messages stop appearing in real time.
      handlersRef.current.forEach((handlers, event) => {
        handlers.forEach(handler => {
          socket.off(event, handler); // prevent duplicate listeners
          socket.on(event, handler);
        });
      });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Track unread messages globally so Sidebar badge works on any page
    socket.on('new_message', (data) => {
      const currentUserId = authUser?.userId;
      // Only count messages FROM others (not echoes of our own sends)
      if (data.sender_id !== currentUserId) {
        setUnreadMessageCount(prev => prev + 1);
      }
    });

    socket.on('new_notification', (data) => {
      // Show an instant toast for truly real-time notifications
      toast.success(data.title, {
        description: data.text,
        duration: 5000,
      });
      // Prepend to the notification list so the bell badge updates immediately
      setNotifications(prev => [{
        id: data.id,
        title: data.title,
        message: data.text,
        is_read: false,
        reference_id: data.reference_id ?? null,
        created_at: new Date().toISOString(),
      }, ...prev]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [authUser?.userId]);

  const markNotificationRead = async (id: number) => {
    try {
      const { notificationsApi } = await import('../services/api');
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  // Optimistically mark all unread notifications as read in the UI immediately,
  // then fire the API calls in the background so the red dot disappears instantly.
  const markAllNotificationsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    // Optimistic update — clears the dot right away
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      const { notificationsApi } = await import('../services/api');
      await Promise.all(unread.map(n => notificationsApi.markRead(n.id)));
    } catch (e) {
      console.error("Failed to mark all notifications as read", e);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('syncro_userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    if (businessProfile) {
      localStorage.setItem('syncro_businessProfile', JSON.stringify(businessProfile));
    } else {
      localStorage.removeItem('syncro_businessProfile');
    }
  }, [businessProfile]);

  useEffect(() => {
    localStorage.setItem('syncro_role', role);
  }, [role]);

  return (
    <AppContext.Provider value={{
      role,
      setRole: setRoleState,
      theme,
      setTheme,
      businessProfile,
      setBusinessProfile: setBusinessProfileState,
      hasSellerProfile,
      hasSellerAccount,
      showOnboarding,
      setShowOnboarding,
      userProfile,
      setUserProfile: setUserProfileState,
      authUser,
      isAuthenticated,
      login,
      register,
      verifyEmail,
      logout,
      toggleRole,
      isChatOpen,
      setIsChatOpen,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      unreadMessageCount,
      clearUnreadMessages,
      socketOn,
      socketEmit,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}