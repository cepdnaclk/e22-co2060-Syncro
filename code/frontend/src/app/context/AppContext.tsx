import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

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
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  // Real auth state
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  toggleRole: () => Promise<void>;
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
    setAuthUser(user);
    const newRole = data.role === 'seller' ? 'seller' : 'buyer';
    setRoleState(newRole);
    localStorage.setItem('syncro_role', newRole);
    // Seed the user profile from backend response
    setUserProfileState(prev => ({ ...prev, firstName: data.first_name, email }));
  };

  // Real register — calls backend
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const data = await authApi.register({ email, password, first_name: firstName, last_name: lastName });
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
    // Update stored token with the new one
    const updatedUser: AuthUser = { ...authUser, role: newRole, token: data.access_token };
    setAuthUser(updatedUser);
  };

  // Side effects
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