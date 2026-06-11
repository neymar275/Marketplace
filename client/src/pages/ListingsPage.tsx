import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bike, SlidersHorizontal, RotateCcw, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '@/api/client';
import { ListingCard } from '@/components/ui/ListingCard';

export default function ListingsPage() {
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCondition, setSelectedCondition] = useState('ALL');

  // Pagination Configuration (Strictly locked to 3 columns x 3 rows = 9 items max)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Synchronize marketplace data feeds
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const res = await apiClient.get('/listings');
      return res.data?.data || res.data || [];
    }
  });

  const listings = Array.isArray(response) ? response : [];

  // Reset pagination index back to page 1 whenever active filters shift
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedCondition]);

  // Handle client-side filtration matrix
  const filteredListings = listings.filter((item: any) => {
    const itemCategoryName = item.category?.name || '';
    const categoryMatch = selectedCategory === 'ALL' || itemCategoryName.toLowerCase() === selectedCategory.toLowerCase();
    const conditionMatch = selectedCondition === 'ALL' || item.condition === selectedCondition;
    return categoryMatch && conditionMatch;
  });

  // Window slicing vectors to lock in the item layout limits
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedCondition('ALL');
    setCurrentPage(1);
  };

  // Compile layout stepping arrays
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-chalk/30 flex items-center justify-center font-mono text-sm text-slate animate-pulse">
        Syncing active market indices...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chalk/30 flex items-center justify-center font-body text-sm text-rust p-4 text-center">
        Failed to fetch marketplace data feeds. Ensure your backend server is live on port 4000.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      
      {/* Title Header Section */}
      <div className="mb-8 border-b border-smoke pb-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink tracking-tight">Browse Marketplace</h1>
          <p className="text-xs font-mono text-slate mt-1">
            Showing items {filteredListings.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredListings.length)} of {filteredListings.length} available assets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Sidebar Filters */}
        <div className="space-y-8 lg:sticky lg:top-6 h-fit bg-white/50 p-4 border border-smoke">
          <div className="flex items-center justify-between border-b border-smoke pb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </h2>
            <button 
              onClick={resetFilters}
              className="text-[11px] font-mono text-slate hover:text-rust flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Category Filter Group */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate">Category</h3>
            <div className="flex flex-col gap-2">
              {['ALL', 'Complete Bikes', 'Frames & Forks', 'Components', 'Gear'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left text-sm py-1 px-2 transition-all border-l-2 ${
                    selectedCategory === cat 
                      ? 'font-bold text-rust border-rust bg-chalk/40' 
                      : 'text-slate border-transparent hover:text-ink hover:border-smoke'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Filter Group */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate">Condition</h3>
            <div className="flex flex-col gap-2">
              {['ALL', 'NEW', 'LIKE_NEW', 'GOOD', 'FAIR'].map((cond) => (
                <button
                  key={cond}
                  onClick={() => setSelectedCondition(cond)}
                  className={`text-left text-sm py-1 px-2 transition-all border-l-2 ${
                    selectedCondition === cond 
                      ? 'font-bold text-rust border-rust bg-chalk/40' 
                      : 'text-slate border-transparent hover:text-ink hover:border-smoke'
                  }`}
                >
                  {cond.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Product Catalog Grid Index */}
        <div className="lg:col-span-3 flex flex-col justify-between min-h-[65vh]">
          {filteredListings.length === 0 ? (
            <div className="border border-dashed border-smoke py-24 text-center flex flex-col items-center justify-center flex-grow">
              <LayoutGrid className="h-10 w-10 text-steel mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium text-slate">No marketplace listings match your active filters.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between">
              {/* FIXED: Strict max 3-column configuration framework (Locks 3x3 layout shape) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {paginatedListings.map((listing: any) => (
                  <ListingCard
                    key={listing.id}
                    id={listing.id}
                    slug={listing.slug}
                    title={listing.title}
                    price={listing.price}
                    condition={listing.condition}
                    category={listing.category?.name || listing.category || 'Gear'}
                    images={listing.images}
                  />
                ))}
              </div>

              {/* FIXED: Numerical Stepper controls row now displays permanently */}
              <div className="mt-12 pt-6 border-t border-smoke flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-smoke hover:border-ink text-ink disabled:opacity-30 disabled:hover:border-smoke transition-colors rounded-none"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`px-4 py-2 text-xs font-mono font-bold transition-all border ${
                      currentPage === number
                        ? 'bg-ink border-ink text-white'
                        : 'bg-white border-smoke text-slate hover:text-ink hover:border-ink'
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-smoke hover:border-ink text-ink disabled:opacity-30 disabled:hover:border-smoke transition-colors rounded-none"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}