import { createBrowserRouter } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
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

export const router = createBrowserRouter([
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
    path: '/',
    element: <AppLayout />,
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
]);