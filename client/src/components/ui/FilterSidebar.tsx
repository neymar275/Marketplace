import { useSearchParams } from 'react-router-dom';
import { Button } from './Button';

export const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current state directly from the URL
  const currentCategory = searchParams.get('category') || 'all';
  const currentCondition = searchParams.get('condition') || 'all';
  const currentMaxPrice = searchParams.get('maxPrice') || '5000';

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'bikes', label: 'Complete Bikes' },
    { id: 'frames', label: 'Frames & Forks' },
    { id: 'parts', label: 'Components' },
    { id: 'gear', label: 'Apparel & Gear' }
  ];

  const conditions = [
    { id: 'all', label: 'Any Condition' },
    { id: 'NEW', label: 'Brand New' },
    { id: 'LIKE_NEW', label: 'Like New' },
    { id: 'GOOD', label: 'Good (Used)' },
    { id: 'FAIR', label: 'Fair (Needs Work)' }
  ];

  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-display font-bold text-lg mb-4 text-ink">Category</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="radio" 
                name="category"
                checked={currentCategory === cat.id}
                onChange={() => updateFilter('category', cat.id)}
                className="w-4 h-4 text-rust focus:ring-rust border-smoke cursor-pointer" 
              />
              <span className={`font-body transition-colors ${currentCategory === cat.id ? 'text-ink font-semibold' : 'text-slate group-hover:text-ink'}`}>
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-smoke" />

      {/* Condition */}
      <div>
        <h3 className="font-display font-bold text-lg mb-4 text-ink">Condition</h3>
        <div className="space-y-2">
          {conditions.map(cond => (
            <label key={cond.id} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="radio" 
                name="condition"
                checked={currentCondition === cond.id}
                onChange={() => updateFilter('condition', cond.id)}
                className="w-4 h-4 text-rust focus:ring-rust border-smoke cursor-pointer" 
              />
              <span className={`font-body transition-colors ${currentCondition === cond.id ? 'text-ink font-semibold' : 'text-slate group-hover:text-ink'}`}>
                {cond.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-smoke" />

      {/* Price Range */}
      <div>
        <h3 className="font-display font-bold text-lg mb-4 text-ink">Max Price</h3>
        <div className="space-y-4">
          <input 
            type="range" 
            min="0" 
            max="5000" 
            step="100"
            value={currentMaxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full accent-rust cursor-pointer"
          />
          <div className="flex justify-between font-mono text-sm text-slate">
            <span>$0</span>
            <span className="font-bold text-ink">${currentMaxPrice}</span>
          </div>
        </div>
      </div>

      <Button fullWidth variant="outline" onClick={clearFilters} className="mt-4">
        Reset Filters
      </Button>
    </aside>
  );
};