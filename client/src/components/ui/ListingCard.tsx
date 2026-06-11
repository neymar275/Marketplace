import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Badge } from './Badge';

interface ListingCardProps {
  id: string;
  slug: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  imageUrl?: string; // For backwards compatibility
  images?: string[]; // 👈 FIXED: Accept the native array returned from the backend
}

export const ListingCard = ({ id, slug, title, price, condition, category, imageUrl, images }: ListingCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  
  // Fallback pattern background if no image exists
  const fallbackBg = "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23e8e2d9' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E";

  // 1. FIXED: Look for the first image in the array, then look for the single string prop
  const activeRawImage = (images && images.length > 0) ? images[0] : imageUrl;

  // 2. FIXED: Route the relative local string path to your live backend Express server port
  const resolvedImageUrl = activeRawImage 
    ? (activeRawImage.startsWith('http') ? activeRawImage : `http://localhost:4000${activeRawImage}`)
    : fallbackBg;

  return (
    <div className="group flex flex-col bg-white border border-smoke hover:border-ink hover:shadow-xl transition-all duration-300 relative rounded-none w-full">
      
      {/* Image Container - Switched to aspect-[4/3] for a modern, wider landscape look */}
      <div className="relative aspect-[4/3] w-full bg-smoke overflow-hidden torn-edge z-10 border-b border-chalk">
        <div 
          className="absolute inset-0 bg-cover bg-center group-hover:scale-102 transition-transform duration-500"
          style={{ backgroundImage: `url(${resolvedImageUrl})` }} // 👈 Renders absolute port 4000 assets cleanly
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge color="ink">{category}</Badge>
          <Badge color={condition === 'NEW' || condition === 'LIKE_NEW' ? 'sprocket' : 'slate'}>
            {condition.replace('_', ' ')}
          </Badge>
        </div>

        {/* Save Button */}
        <button 
          onClick={(e) => { e.preventDefault(); setIsSaved(!isSaved); }}
          className="absolute top-3 right-3 p-2 bg-chalk/90 backdrop-blur hover:bg-white rounded-full transition-all focus-visible:ring-2 focus-visible:ring-rust"
          aria-label={isSaved ? "Unsave listing" : "Save listing"}
        >
          <Heart className={`h-4 w-4 transition-colors ${isSaved ? 'fill-rust text-rust' : 'text-ink'}`} />
        </button>
      </div>

      {/* Content Container with clean padding and micro-details */}
      <Link 
        to={`/listings/${slug}`} 
        state={{ title, price, condition, category, imageUrl: resolvedImageUrl }} // Forwards resolved asset context downstream
        className="flex flex-col p-4 flex-grow focus:outline-none justify-between"
      >
        <div>
          <h3 className="font-body font-semibold text-base sm:text-lg text-ink line-clamp-2 leading-tight mb-4 group-hover:text-rust transition-colors">
            {title}
          </h3>
        </div>
        
        {/* Price Row with clean bottom divider spacing */}
        <div className="pt-3 border-t border-chalk flex items-baseline justify-between">
          <span className="text-xs text-slate font-body">Asking Price</span>
          <span className="font-mono text-xl font-bold text-rust tracking-tight">
            ${Number(price).toFixed(2)}
          </span>
        </div>
      </Link>
    </div>
  );
};