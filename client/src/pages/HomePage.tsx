import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { ListingCard } from '@/components/ui/ListingCard';
import { apiClient } from '@/api/client'; // 👈 FIXED: Import unified API client handler

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  // Scroll listener for hero parallax effect - preserved for performance
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 1. FIXED: Synchronize with your active Express backend using React Query and apiClient
  const { data: response, isLoading } = useQuery({
    queryKey: ['listings', 'active'],
    queryFn: async () => {
      const res = await apiClient.get('/listings');
      return res.data;
    }
  });

  // 2. FIXED: Safely unpack database arrays matching your backend pagination wrapper structure
  const rawListings = response?.listings || response?.data || (Array.isArray(response) ? response : []);
  
  // Slice the top 4 most recently dropped entries to display on the highlight strip
  const freshDrops = rawListings.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-ink pt-32 md:pt-40 pb-40 px-6 border-b-8 border-rust">
        
        {/* Parallax Background Grid */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ 
            backgroundImage: "radial-gradient(#F5F0E8 2px, transparent 2px)",
            backgroundSize: "40px 40px",
            transform: `translateY(${scrollY * 0.2}px)`,
            willChange: 'transform'
          }}
        />
        
        {/* Dynamic split layout on larger viewports */}
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* Column 1: Text Content */}
          <div className="flex flex-col items-start animate-hero-content-enter will-change-transform will-change-opacity">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-chalk leading-[1.1] mb-8 max-w-4xl">
              Every bike has a story. <br/>
              <span className="text-rust">This one's looking for its next chapter.</span>
            </h1>
            
            <div className="animate-hero-stagger-1 will-change-transform will-change-opacity">
              <Link to="/listings">
                <Button variant="primary" className="browse-btn text-lg px-8 py-4 rounded-full">
                  Browse what's available
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-3 animate-hero-stagger-2 will-change-transform will-change-opacity">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sprocket opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sprocket"></span>
              </span>
              <p className="font-mono text-smoke">
                {isLoading ? '...' : rawListings.length} items listed right now
              </p>
            </div>
          </div>

          {/* Column 2: Performance-optimized visual collage */}
          <div className="relative h-[400px] md:h-[500px] animate-hero-images-enter will-change-transform will-change-opacity">
            <div className="absolute inset-0 flex justify-center items-center">
              
              {/* Feature Bike 1: middle Frame */}
              <div 
                className="absolute w-[80%] h-[80%] top-[10%] right-[10%] border-4 border-chalk rounded-2xl shadow-xl overflow-hidden animate-hero-bike-1 will-change-transform will-change-opacity"
              >
                <img 
                  src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44" 
                  alt="A performance trail bike"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              
              {/* Feature Bike 2: Bottom Frame */}
              <div 
                className="absolute w-[60%] h-[60%] top-[40%] right-[0%] border-4 border-sprocket rounded-xl shadow-2xl overflow-hidden animate-hero-bike-2 will-change-transform will-change-opacity"
              >
                <img 
                  src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44" 
                  alt="A high-end matte black road bike"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              
              {/* Feature Bike 3: top Frame */}
              <div 
                className="absolute w-[50%] h-[50%] top-[-5%] left-[-5%] border-2 border-rust rounded-lg shadow-md overflow-hidden animate-hero-bike-3 will-change-transform will-change-opacity opacity-75"
              >
                <img 
                  src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800"
                  alt="Sleek urban bicycle profile"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Fresh Drops Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-display font-bold text-ink">Fresh to the market</h2>
            <p className="text-slate mt-2 font-body">Recently listed gear and complete builds.</p>
          </div>
          <Link to="/listings" className="hidden md:block font-semibold text-rust hover:underline">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-96 bg-white border border-smoke animate-pulse torn-edge" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {freshDrops.map((listing: any) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                slug={listing.slug}
                title={listing.title}
                price={listing.price}
                condition={listing.condition}
                category={listing.category?.name || 'Gear'}
                images={listing.images} // 👈 FIXED: Feeds down the raw path array to resolve port 4000
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}