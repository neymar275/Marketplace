import { FallbackProps } from 'react-error-boundary';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-white border border-smoke torn-edge text-center max-w-2xl mx-auto my-12">
      <AlertTriangle className="h-16 w-16 text-rust mb-6" />
      <h2 className="text-3xl font-display font-bold text-ink mb-4">Well, this is awkward.</h2>
      <p className="text-slate font-body mb-8 max-w-md">
        Something just broke in the workshop. We've logged the error, but you can try resetting the view to get back on track.
      </p>
      
      {/* Only show technical details in development */}
      {import.meta.env.DEV && (
        <pre className="text-left bg-chalk p-4 w-full overflow-x-auto text-xs font-mono text-slate mb-8">
          {error.message}
        </pre>
      )}

      <Button onClick={resetErrorBoundary} variant="primary">
        Try Again
      </Button>
    </div>
  );
};