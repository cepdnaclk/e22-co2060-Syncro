import React from 'react';
import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

export function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">{t('notFound.title')}</h2>
        <p className="text-muted-foreground mb-8 max-w-md">{t('notFound.description')}</p>
        <Link to="/dashboard">
          <Button><Home className="w-4 h-4 mr-2" />{t('notFound.backToDashboard')}</Button>
        </Link>
      </div>
    </div>
  );
}
