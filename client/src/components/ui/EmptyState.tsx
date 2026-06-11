import { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

// MAKE SURE IT SAYS "export const EmptyState" HERE:
export const EmptyState = ({ 
  icon = <PackageOpen className="h-16 w-16 text-steel" />, 
  title, 
  description, 
  actionText, 
  actionHref 
}: EmptyStateProps) => {
  return (
    <div className="w-full py-20 px-6 bg-chalk border border-smoke torn-edge flex flex-col items-center text-center">
      <div className="mb-6 opacity-50">{icon}</div>
      <h3 className="text-2xl font-display font-bold text-ink mb-2">{title}</h3>
      <p className="text-slate font-body max-w-md mb-8">{description}</p>
      
      {actionText && actionHref && (
        <Link to={actionHref}>
          <Button variant="outline">{actionText}</Button>
        </Link>
      )}
    </div>
  );
};