import React, { useEffect } from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Discovery } from './pages/Discovery';
import { ServiceDetail } from './pages/ServiceDetail';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { OrderDetail } from './pages/OrderDetail';
import { Payment } from './pages/Payment';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { Messages } from './pages/Messages';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { PublicSellerProfile } from './pages/PublicSellerProfile';
import { Bids } from './pages/Bids';
import { BidDetail } from './pages/BidDetail';

import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { HelpCenter } from './pages/HelpCenter';
import { ScrollToTopButton } from './components/ScrollToTopButton';

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }
  }, [pathname, search, hash]);

  return null;
}

function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <ScrollRestoration />
      <Outlet />
      <ScrollToTopButton />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/verify-email',
        element: <VerifyEmail />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: '/terms',
        element: <TermsOfService />,
      },
      {
        path: '/privacy',
        element: <PrivacyPolicy />,
      },
      {
        path: '/help',
        element: <HelpCenter />,
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'discover', element: <Discovery /> },
          { path: 'service/:id', element: <ServiceDetail /> },
          { path: 'order/confirmation', element: <OrderConfirmation /> },
          { path: 'order/:id', element: <OrderDetail /> },
          { path: 'payment', element: <Payment /> },
          { path: 'payment/success', element: <PaymentSuccess /> },
          { path: 'messages', element: <Messages /> },
          { path: 'settings', element: <Settings /> },
          { path: 'bids', element: <Bids /> },
          { path: 'bids/:id', element: <BidDetail /> },
          { path: 'orders', element: <Dashboard /> },
          { path: 'payments', element: <Payment /> },
          { path: 'listings', element: <Dashboard /> },
          { path: 'orders-received', element: <Dashboard /> },
          { path: 'earnings', element: <Dashboard /> },
          { path: 'seller/:id', element: <PublicSellerProfile /> },
          { path: 'seller/preview', element: <PublicSellerProfile /> },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);