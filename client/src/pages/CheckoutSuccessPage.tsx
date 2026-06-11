import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white border border-smoke torn-edge p-8 text-center">
        <CheckCircle className="h-16 w-16 text-sprocket mx-auto mb-6" />
        <h1 className="text-4xl font-display font-bold text-ink mb-4">You got it!</h1>
        <p className="text-slate font-body mb-8">
          Your payment was successful. The seller has been notified and will prepare your gear for shipping.
        </p>
        {orderId && (
          <div className="bg-chalk p-4 mb-8 font-mono text-sm text-ink">
            Order Ref: {orderId.split('-')[0].toUpperCase()}
          </div>
        )}
        <Link to="/dashboard">
          <Button fullWidth>View My Orders</Button>
        </Link>
      </div>
    </div>
  );
}