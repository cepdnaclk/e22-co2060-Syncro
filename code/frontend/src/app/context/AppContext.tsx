import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  register: (email: string, password: string, firstName: string, lastName: string, location: string) => Promise<void>;
  logout: () => void;
  toggleRole: () => Promise<void>;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  notifications: any[];
  markNotificationRead: (id: number) => Promise<void>;
  // Subscribe to a socket event from any page component.
  // Returns an unsubscribe function — call it in useEffect cleanup.
  socketOn: (event: string, handler: (data: any) => void) => () => void;
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

  // Holds the live socket so pages can subscribe without creating their own connection
  const socketRef = useRef<Socket | null>(null);

  // Pages call socketOn(event, handler) in a useEffect and return the unsubscribe fn.
  // This forwards directly to the shared socket — no second connection needed.
  const socketOn = (event: string, handler: (data: any) => void) => {
    const socket = socketRef.current;
    if (socket) socket.on(event, handler);
    return () => {
      if (socketRef.current) socketRef.current.off(event, handler);
    };
  };

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

    if (data.role === 'seller') {
      setHasSellerAccount(true);
    }

    // Try to fetch seller profile to restore seller toggle state
    try {
      // Must use profilesApi from the imported module (already added to top of file)
      const { profilesApi } = await import('../services/api');
      const profile = await profilesApi.get(data.user_id);
      
      // A user is only considered to have a seller account if they completed onboarding
      // The default profile created on registration has an empty description
      if (profile && profile.description && profile.description.trim() !== '') {
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

  // Real register — calls backend
  const register = async (email: string, password: string, firstName: string, lastName: string, location: string) => {
    const data = await authApi.register({ email, password, first_name: firstName, last_name: lastName, location });
    const user: AuthUser = {
      userId: data.user_id,
      email,
      firstName: data.first_name,
      role: data.role,
      token: data.access_token,
    };
    setAuthUser(user);
    localStorage.setItem('syncro_role', 'buyer');
    setRoleState('buyer');
    setUserProfileState({ firstName, lastName, email });
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

  // ── Effect 2: Socket.IO connection — only reconnect when userId changes ──────
  // Keyed on userId so a role toggle (which changes authUser but NOT userId)
  // does NOT tear down and rebuild the connection unnecessarily.
  useEffect(() => {
    const userId = authUser?.userId;
    if (!userId) return;

    const socket: Socket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000');
    socketRef.current = socket; // expose to pages via socketOn()

    socket.on('connect', () => {
      // Join the personal room so the backend can target this user
      socket.emit('identify', { userId });
      console.log(`🔔 Socket connected and identified as user ${userId}`);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
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
      logout,
      toggleRole,
      isChatOpen,
      setIsChatOpen,
      notifications,
      markNotificationRead,
      socketOn,
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