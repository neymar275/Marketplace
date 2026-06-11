import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/api/client';

export default function RegisterPage() {
  const navigate = useNavigate();

  // State Management Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Operational State Tracking
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Client-Side Sanity Validation
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all registration parameters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // 2. Dispatch payloads directly to backend registration endpoint via apiClient
      await apiClient.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // Forward directly to login area on successful registration handshake
      navigate('/login', { state: { accountCreated: true, email: email.trim().toLowerCase() } });
    } catch (err: any) {
      console.error('Registration processing failed:', err);
      // Cleanly fallback down Axios response nests
      setError(err.response?.data?.message || 'An error occurred during account creation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 font-body bg-chalk/10">
      <div className="max-w-md w-full space-y-8 bg-white p-8 border border-smoke shadow-sm">
        
        {/* Title Group */}
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-ink tracking-tight">Create an Account</h2>
          <p className="mt-2 text-sm text-slate">
            Already have an active profile?{' '}
            <Link to="/login" className="font-semibold text-rust hover:underline">
              Log in instead
            </Link>
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rust/5 border border-rust text-rust text-sm flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Public Name Parameter Field */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-xs font-mono uppercase tracking-wider font-bold text-slate">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-4 h-5 w-5 text-steel" />
              <input
                id="username"
                type="text"
                required
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Doe"
                className="w-full bg-white border border-smoke pl-12 pr-4 py-3 text-ink focus:outline-none focus:border-ink rounded-none text-sm disabled:opacity-60"
              />
            </div>
          </div>

          {/* Email Identity Parameter Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider font-bold text-slate">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 h-5 w-5 text-steel" />
              <input
                id="email"
                type="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white border border-smoke pl-12 pr-4 py-3 text-ink focus:outline-none focus:border-ink rounded-none text-sm disabled:opacity-60"
              />
            </div>
          </div>

          {/* Main Key Token Field */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider font-bold text-slate">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-5 w-5 text-steel" />
              <input
                id="password"
                type="password"
                required
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-white border border-smoke pl-12 pr-4 py-3 text-ink focus:outline-none focus:border-ink rounded-none text-sm font-mono disabled:opacity-60"
              />
            </div>
          </div>

          {/* Key Validation Entry Field */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-xs font-mono uppercase tracking-wider font-bold text-slate">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-5 w-5 text-steel" />
              <input
                id="confirmPassword"
                type="password"
                required
                disabled={isSubmitting}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-white border border-smoke pl-12 pr-4 py-3 text-ink focus:outline-none focus:border-ink rounded-none text-sm font-mono disabled:opacity-60"
              />
            </div>
          </div>

          {/* Terms Agreement Checkbox Box */}
          <div className="text-xs text-slate font-body leading-normal pt-1">
            By creating an account, you agree to our marketplace terms of service, platform safety guidelines, and payment transaction policies.
          </div>

          {/* Action Processing Triggers */}
          <div className="pt-3">
            <Button
              type="submit"
              fullWidth
              className="py-4 text-sm font-mono uppercase tracking-wider rounded-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering New Profile...' : 'Complete Account Registration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}