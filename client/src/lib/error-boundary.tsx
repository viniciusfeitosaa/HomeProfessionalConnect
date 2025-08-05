import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Algo deu errado</h2>
            <p className="text-gray-400 mb-4">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}