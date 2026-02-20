import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER_PROFILE: UserProfile = {
  firstName: 'Alex',
  lastName: 'Rivera',
  email: 'alex.rivera@example.com',
  phone: '+1 (555) 123-4567',
  bio: 'Passionate about connecting buyers and sellers on Syncro.',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Role with localStorage persistence
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('syncro_role');
      if (stored === 'buyer' || stored === 'seller') {
        return stored;
      }
    }
    return 'buyer';
  });

  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // User profile with localStorage persistence
  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('syncro_userProfile');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse user profile from localStorage:', e);
        }
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  // Business profile with localStorage persistence
  const [businessProfile, setBusinessProfileState] = useState<BusinessProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('syncro_businessProfile');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse business profile from localStorage:', e);
        }
      }
    }
    return null;
  });

  const [showOnboarding, setShowOnboarding] = useState(false);

  const hasSellerProfile = businessProfile !== null;

  // Persist theme changes to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist user profile changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncro_userProfile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // Persist business profile changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (businessProfile) {
        localStorage.setItem('syncro_businessProfile', JSON.stringify(businessProfile));
      } else {
        localStorage.removeItem('syncro_businessProfile');
      }
    }
  }, [businessProfile]);

  // Persist role changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncro_role', role);
    }
  }, [role]);

  // Wrapper function to update user profile
  const setUserProfile = (profile: UserProfile) => {
    setUserProfileState(profile);
  };

  // Wrapper function to update business profile
  const setBusinessProfile = (profile: BusinessProfile) => {
    setBusinessProfileState(profile);
  };

  // Wrapper function to update role
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      theme,
      setTheme,
      businessProfile,
      setBusinessProfile,
      hasSellerProfile,
      showOnboarding,
      setShowOnboarding,
      userProfile,
      setUserProfile,
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