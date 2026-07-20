import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { AppProvider } from './context/AppContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { useTranslation } from 'react-i18next';

function AppInner() {
  const { i18n } = useTranslation();

  // Keep <html lang="..."> in sync with i18n language changes
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}