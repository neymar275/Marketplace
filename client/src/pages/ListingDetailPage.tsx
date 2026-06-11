import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bike, Tag, ShieldCheck, User, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/Button';

export default function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();

  // Extract router state if passed during card navigation for instant loading layout decoration
  const routeState = location.state as {
    title?: string;
    price?: number | string;
    condition?: string;
    category?: string;
    imageUrl?: string;
  } | null;

  // 1. Fetch deep details from your live backend engine using the unique URL slug parameter
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['listing', slug],
    queryFn: async () => {
      const res = await apiClient.get(`/listings/${slug}`);
      return res.data?.data || res.data;
    },
    enabled: !!slug,
  });

  // Safe base data mapping with immediate state fallback protection layout references
  const listing = response || {};
  const displayTitle = listing.title || routeState?.title || 'Loading item...';
  const displayPrice = listing.price || routeState?.price || '0.00';
  const displayCondition = listing.condition || routeState?.condition || 'GOOD';
  const displayCategory = listing.category?.name || listing.category || routeState?.category || 'Gear';

  /**
   * Helper utility matching our ListingCard logic to route assets to port 4000 safely
   */
  const resolveImageUrl = (imagePath: string | undefined): string => {
    const fallbackPlaceholder = 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800';
    if (!imagePath) return routeState?.imageUrl || fallbackPlaceholder;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:4000${imagePath}`;
  };

  const mainImageUrl = resolveImageUrl(listing.images?.[0]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center font-body">
        <AlertCircle className="h-12 w-12 text-rust mx-auto mb-4" />
        <h2 className="text-xl font-bold text-ink">Failed to load item info</h2>
        <p className="text-slate text-sm mt-1 mb-6">This listing may have been moved, sold, or deleted from PostgreSQL.</p>
        <Link to="/listings" className="text-sm font-mono uppercase tracking-wider text-rust hover:underline">
          ← Back to catalogue index
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      
      {/* Back Navigation Bar Anchor link */}
      <div className="mb-8">
        <Link 
          to="/listings" 
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
      </div>

      {/* Main Structural Detail Component Matrix splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* LEFT COLUMN: FIXED MAIN IMAGE WINDOW DISPLAY */}
        <div className="border border-smoke bg-white p-2 relative group overflow-hidden shadow-sm">
          <div className="aspect-[4/3] w-full bg-chalk overflow-hidden relative">
            <img 
              src={mainImageUrl} 
              alt={displayTitle}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading && !routeState ? 'opacity-40' : 'opacity-100'}`} 
            />
          </div>
          
          {/* Base Meta info Pill tag indicators overlays */}
          <div className="absolute top-6 left-6 flex gap-2">
            <span className="bg-ink text-white font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 font-bold shadow-sm">
              {displayCategory}
            </span>
            <span className="bg-rust text-white font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 font-bold shadow-sm">
              {displayCondition.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: CORE PRODUCT DETAILS & TRANSACTION ENGINE ACTIONS */}
        <div className="space-y-8">
          
          {/* Header Identity Core blocks */}
          <div className="border-b border-smoke pb-6 space-y-3">
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-ink leading-tight tracking-tight">
              {displayTitle}
            </h1>
            
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-xs font-mono text-slate uppercase">Asking Price:</span>
              <span className="text-3xl font-mono font-bold text-rust tracking-tight">
                ${Number(displayPrice).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Description Text Copy area blocks */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate">Product Details</h3>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap bg-white border border-smoke p-5 shadow-sm min-h-[120px]">
              {listing.description || (isLoading ? 'Syncing technical parameters file descriptions...' : 'No description provided.')}
            </p>
          </div>

          {/* Trust Meta Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="border border-smoke p-4 bg-white/60 flex items-center gap-3">
              <User className="h-5 w-5 text-steel flex-shrink-0" />
              <div>
                <p className="text-[10px] font-mono text-slate uppercase">Listed By</p>
                <p className="text-sm font-semibold text-ink">{listing.seller?.name || 'Verified Marketplace User'}</p>
              </div>
            </div>

            <div className="border border-smoke p-4 bg-white/60 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-steel flex-shrink-0" />
              <div>
                <p className="text-[10px] font-mono text-slate uppercase">Date Published</p>
                <p className="text-sm font-semibold text-ink">
                  {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Just Now'}
                </p>
              </div>
            </div>
          </div>

          {/* Purchase Trigger Matrix Handles */}
          <div className="pt-4 border-t border-smoke space-y-4">
            <Button 
              fullWidth 
              className="py-4 font-mono uppercase tracking-wider text-sm rounded-none shadow-sm"
              disabled={isLoading}
            >
              Initiate Direct Purchase Securely
            </Button>
            
            <button 
              className="w-full py-3.5 border border-smoke hover:border-ink text-ink font-mono uppercase tracking-wider text-xs font-bold transition-colors flex items-center justify-center gap-2 bg-white rounded-none"
              disabled={isLoading}
            >
              <MessageSquare className="h-4 w-4" /> Message Seller For Details
            </button>

            <div className="flex items-center gap-2 justify-center text-[11px] font-mono text-slate pt-1">
              <ShieldCheck className="h-4 w-4 text-sprocket" /> Funds are escrow protected under our marketplace platform policies.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}