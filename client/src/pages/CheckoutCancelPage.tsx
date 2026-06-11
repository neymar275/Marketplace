import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CheckoutCancelPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white border border-smoke torn-edge p-8 text-center">
        <XCircle className="h-16 w-16 text-rust mx-auto mb-6" />
        <h1 className="text-4xl font-display font-bold text-ink mb-4">Checkout Cancelled</h1>
        <p className="text-slate font-body mb-8">
          No charges were made. The item is still available on the market if you change your mind.
        </p>
        <Link to="/listings">
          <Button fullWidth variant="outline">Return to Market</Button>
        </Link>
      </div>
    </div>
  );
}
