/**
 * =============================================================================
 * ErrorBoundary — Gestion des erreurs React
 * =============================================================================
 * Capture les erreurs dans l'arbre de composants enfants et affiche un fallback
 * UI au lieu de planter toute l'application.
 *
 * En production, les erreurs sont loguees vers le backend (/api/logs/client).
 * =============================================================================
 */

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
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

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Une erreur est survenue
              </h1>
              <p className="text-muted-foreground">
                Nous sommes desoles, une erreur inattendue s'est produite.
                Veuillez reessayer ou revenir a l'accueil.
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
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reessayer
              </Button>
              <Button asChild variant="outline">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
