import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Controlled Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Isolated Local UI Status Tracking
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(''); // 👈 FIXED: Isolated local state channel
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-populate email if redirected from a successful registration lifecycle
  useEffect(() => {
    const navState = location.state as { accountCreated?: boolean; email?: string };
    if (navState?.accountCreated) {
      setSuccessMessage('Account created successfully! Please log in below.');
    }
    if (navState?.email) {
      setEmail(navState.email);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      setLocalError('Please provide your complete profile credentials.');
      return;
    }

    try {
      setIsSubmitting(true);
      setLocalError('');
      setSuccessMessage('');

      // Authenticate against the live Express session engine
      const response = await apiClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = response.data;

      // Pass credentials to the clean global state container
      await login(token, user);

      // Return user to their intended protected page context (e.g., /sell)
      const fromDestination = (location.state as any)?.from?.pathname || '/sell';
      navigate(fromDestination, { replace: true });

    } catch (err: any) {
      console.error('Login authentication transaction failed:', err);
      setLocalError(err.response?.data?.message || 'Invalid email or password combination.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 font-body bg-chalk/10">
      <div className="max-w-md w-full space-y-8 bg-white p-8 border border-smoke shadow-sm">
        
        {/* Header Title Block */}
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-ink tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-rust hover:underline">
              Sign up today
            </Link>
          </p>
        </div>

        {/* Success Feedback Toast banner */}
        {successMessage && (
          <div className="p-4 bg-sprocket/5 border border-sprocket text-sprocket text-sm flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Local Error Output Container */}
        {localError && (
          <div className="p-4 bg-rust/5 border border-rust text-rust text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Identity Input field */}
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

          {/* Password Input field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider font-bold text-slate">
                Password
              </label>
              <a href="#" className="text-xs font-mono text-slate hover:text-ink">Forgot password?</a>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-5 w-5 text-steel" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-smoke pl-12 pr-12 py-3 text-ink focus:outline-none focus:border-ink rounded-none text-sm font-mono disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-steel hover:text-ink focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Form Action Triggers */}
          <div className="pt-2">
            <Button
              type="submit"
              fullWidth
              className="py-4 text-sm font-mono uppercase tracking-wider rounded-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating Profile...' : 'Sign In To Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}