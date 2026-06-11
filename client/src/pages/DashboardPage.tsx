import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bike, Box, LayoutGrid, PlusCircle, ShoppingBag, Settings, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/api/client';
import { ListingCard } from '@/components/ui/ListingCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'settings'>('listings');

  // Sync personal inventory database rows using React Query
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const res = await apiClient.get('/listings/user/me');
      return res.data?.data || res.data || [];
    }
  });

  const userListings = Array.isArray(response) ? response : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      
      {/* 1. PROFILE PROFILE HEADER BANNER */}
      <div className="bg-ink border-b-8 border-rust p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm mb-10">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-rust text-chalk font-display font-extrabold text-2xl flex items-center justify-center border-2 border-chalk">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-chalk tracking-tight flex items-center gap-2">
              Welcome back, {user?.name || 'Verified Seller'} <UserCheck className="h-5 w-5 text-sprocket" />
            </h1>
            <p className="text-xs font-mono text-smoke/70 mt-0.5">Account Member ID: {user?.id || 'Active Session'}</p>
          </div>
        </div>

        {/* Floating Call-to-Action Action triggers */}
        <Link to="/sell">
          <button className="flex items-center gap-2 bg-rust hover:bg-rust/90 text-white font-mono text-xs uppercase font-bold tracking-wider px-5 py-3.5 border border-transparent hover:border-chalk transition-all">
            <PlusCircle className="h-4 w-4" /> Post An Asset Build
          </button>
        </Link>
      </div>

      {/* 2. MANAGEMENT CONTROL WORKSPACE NAVIGATION TABS */}
      <div className="flex border-b border-smoke mb-8 gap-1">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'listings' 
              ? 'border-ink text-ink bg-chalk/30' 
              : 'border-transparent text-slate hover:text-ink'
          }`}
        >
          <Box className="h-4 w-4" /> My Shop Inventory ({userListings.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'orders' 
              ? 'border-ink text-ink bg-chalk/30' 
              : 'border-transparent text-slate hover:text-ink'
          }`}
        >
          <ShoppingBag className="h-4 w-4" /> Purchase Ledgers
        </button>
      </div>

      {/* 3. DYNAMIC WORKSPACE PANEL VIEWER CHANNELS */}
      {isLoading ? (
        <div className="font-mono text-sm text-slate py-12 animate-pulse text-center">
          Aggregating verified account inventory matrix indices...
        </div>
      ) : error ? (
        <div className="font-body text-sm text-rust py-12 text-center border border-dashed border-rust/30 bg-rust/5">
          Failed to load profile dashboard items. Ensure your port 4000 server token channels are authenticated.
        </div>
      ) : activeTab === 'listings' ? (
        <div>
          {userListings.length === 0 ? (
            <div className="border border-dashed border-smoke py-20 text-center flex flex-col items-center justify-center bg-white/50">
              <LayoutGrid className="h-10 w-10 text-steel mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium text-slate mb-5">You haven't listed any gear items on the marketplace yet.</p>
              <Link to="/sell">
                <button className="bg-ink hover:bg-ink/90 text-white font-mono text-xs uppercase font-bold tracking-wider px-4 py-2.5">
                  Publish Your First Listing
                </button>
              </Link>
            </div>
          ) : (
            /* Strict max 3-column configuration framework (Locks layout grid system shapes) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {userListings.map((item: any) => (
                <ListingCard
                  key={item.id}
                  id={item.id}
                  slug={item.slug}
                  title={item.title}
                  price={item.price}
                  condition={item.condition}
                  category={item.category?.name || 'Gear'}
                  images={item.images}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="border border-smoke p-12 text-center bg-white/40 font-body text-sm text-slate">
          No current transaction ledgers logged under this profile session index framework.
        </div>
      )}

    </div>
  );
}