/**
 * =============================================================================
 * ErrorBoundary — Gestion des erreurs React
 * =============================================================================
 * Capture les erreurs dans l'arbre de composants enfants et affiche un fallback
 * UI contextualise selon le type d'erreur :
 *   - Erreur reseau : message + bouton rafraichir
 *   - Erreur auth (401/403) : message + redirection login
 *   - Autre erreur : message generique + reessayer / accueil
 *
 * En production, les erreurs sont loguees vers le backend (/api/logs/client).
 * =============================================================================
 */

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, WifiOff, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

type ErrorType = 'network' | 'auth' | 'unknown';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function getErrorType(error: Error | null): ErrorType {
  if (!error) return 'unknown';
  const msg = error.message.toLowerCase();
  if (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('err_internet_disconnected') ||
    msg.includes('network request failed') ||
    msg.includes('fetch') && msg.includes('abort')
  ) {
    return 'network';
  }
  if (
    msg.includes('401') ||
    msg.includes('403') ||
    msg.includes('unauthorized') ||
    msg.includes('forbidden')
  ) {
    return 'auth';
  }
  return 'unknown';
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);

    // Logger vers le backend en production
    if (import.meta.env.PROD) {
      try {
        fetch('/api/logs/client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        // ignore
      }
    }
  }

  handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorType = getErrorType(this.state.error);

      let title = 'Une erreur est survenue';
      let description = 'Nous sommes desoles, une erreur inattendue s\'est produite. Veuillez reessayer ou revenir a l\'accueil.';
      let icon = <AlertTriangle className="w-8 h-8 text-destructive" />;
      let primaryAction = (
        <Button onClick={this.handleReset} variant="default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reessayer
        </Button>
      );

      if (errorType === 'network') {
        title = 'Probleme de connexion';
        description = 'Impossible de joindre le serveur. Verifiez votre connexion reseau et reessayez.';
        icon = <WifiOff className="w-8 h-8 text-amber-500" />;
        primaryAction = (
          <Button onClick={this.handleReload} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Rafraichir la page
          </Button>
        );
      }

      if (errorType === 'auth') {
        title = 'Session expiree';
        description = 'Votre session a expire ou vous n\'avez pas les droits necessaires. Veuillez vous reconnecter.';
        icon = <LogIn className="w-8 h-8 text-primary" />;
        primaryAction = (
          <Button asChild variant="default">
            <Link to="/login">
              <LogIn className="w-4 h-4 mr-2" />
              Se reconnecter
            </Link>
          </Button>
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              {icon}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {title}
              </h1>
              <p className="text-muted-foreground">
                {description}
              </p>
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Details de l'erreur (dev)
                  </summary>
                  <pre className="mt-2 p-3 rounded bg-muted text-xs overflow-auto max-h-48">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {primaryAction}
              {errorType !== 'auth' && (
                <Button asChild variant="outline">
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Accueil
                  </Link>
                </Button>
              )}
              {errorType === 'auth' && (
                <Button onClick={this.handleReload} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Rafraichir
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
