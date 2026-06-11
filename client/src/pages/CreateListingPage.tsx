import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Bike, Tag, AlertCircle, Info } from 'lucide-react';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Controlled Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [categoryName, setCategoryName] = useState('Complete Bikes');
  
  // File Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Handle local asset image preview generation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('File size exceeds safety thresholds. Maximum size limit is 5MB.');
        return;
      }
      setFormError('');
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file)); // Generates temporary preview string window
    }
  };

  // Hook up the execution request via a TanStack Mutation
  const { mutate: publishItem, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.post('/listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Informs Express to parse as multipart binary stream
        },
      });
      return res.data;
    },
    onSuccess: () => {
      // Clear cache feeds instantly so the homepage/browse grids refresh their listings lists
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      navigate('/listings'); // Return user to catalog frame
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || 'Database rejected listing serialization profiles.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !price || !categoryName) {
      setFormError('Please fill out all required validation parameter entries.');
      return;
    }

    // Compiling the Multi-part Payload Object
    const dataPayload = new FormData();
    dataPayload.append('title', title.trim());
    dataPayload.append('description', description.trim());
    dataPayload.append('price', price);
    dataPayload.append('condition', condition);
    dataPayload.append('categoryName', categoryName);
    dataPayload.append('sellerId', user?.id || ''); // Explicitly binds ownership parameters

    if (selectedFile) {
      dataPayload.append('images', selectedFile); // Maps directly to your backend multer keyword key rule
    }

    publishItem(dataPayload);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      <div className="border border-smoke bg-white p-8 shadow-sm">
        
        {/* Section Heading Titles */}
        <div className="mb-8 border-b border-smoke pb-5">
          <h1 className="text-2xl font-display font-bold text-ink tracking-tight flex items-center gap-2">
            List an Item <Bike className="h-5 w-5 text-rust" />
          </h1>
          <p className="text-xs text-slate mt-1 font-mono uppercase">Marketplace Asset Intake Terminal</p>
        </div>

        {formError && (
          <div className="p-4 bg-rust/5 border border-rust text-rust text-sm flex items-center gap-3 mb-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Item Title Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-slate">Listing Title *</label>
            <input
              type="text"
              required
              maxLength={80}
              placeholder="e.g., Specialized Rockhopper Comp 29"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-smoke px-4 py-3 text-ink focus:outline-none focus:border-ink rounded-none text-sm"
            />
          </div>

          {/* Core Multi-Option Selection Parameter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider font-bold text-slate">Category *</label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full bg-white border border-smoke px-4 py-3 text-ink focus:outline-none focus:border-ink rounded-none text-sm"
              >
                <option value="Complete Bikes">Complete Bikes</option>
                <option value="Frames & Forks">Frames & Forks</option>
                <option value="Components">Components</option>
                <option value="Gear">Gear</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider font-bold text-slate">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-white border border-smoke px-4 py-3 text-ink focus:outline-none focus:border-ink rounded-none text-sm"
              >
                <option value="NEW">Brand New / In Box</option>
                <option value="LIKE_NEW">Like New / Mint</option>
                <option value="GOOD">Good / Normal Use</option>
                <option value="FAIR">Fair / Well Ridden</option>
              </select>
            </div>
          </div>

          {/* Pricing Index Fields */}
          <div className="space-y-1.5 max-w-xs">
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-slate">Asking Price ($ USD) *</label>
            <div className="relative flex items-center">
              <Tag className="absolute left-4 h-4 w-4 text-steel" />
              <input
                type="number"
                required
                min="1"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white border border-smoke pl-12 pr-4 py-3 text-ink focus:outline-none focus:border-ink rounded-none text-sm font-mono"
              />
            </div>
          </div>

          {/* Description Block fields */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-slate">Product Overview & Specs</label>
            <textarea
              rows={5}
              maxLength={1000}
              placeholder="Provide component details, histories, wear markers, modifications, or sizing vectors explicitly..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-smoke px-4 py-3 text-ink focus:outline-none focus:border-ink rounded-none text-sm resize-none"
            />
          </div>

          {/* File Upload Drag-and-Drop Area */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-slate">Component Photography</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              
              <label className="border border-dashed border-smoke hover:border-ink transition-colors aspect-[4/3] flex flex-col items-center justify-center p-4 text-center cursor-pointer bg-chalk/20 group">
                <Upload className="h-6 w-6 text-steel group-hover:text-ink transition-colors mb-2 stroke-[1.5]" />
                <span className="text-xs font-mono font-bold uppercase text-slate group-hover:text-ink">Choose Image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>

              {/* Real-time Render Window frame */}
              {imagePreview && (
                <div className="border border-smoke p-1 bg-white aspect-[4/3] overflow-hidden relative shadow-sm sm:col-span-2">
                  <img src={imagePreview} alt="Upload Target Snapshot Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-ink/80 text-white font-mono text-[10px] uppercase tracking-wider px-2 py-1 hover:bg-rust"
                  >
                    Clear File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Trigger Action Controls */}
          <div className="pt-4 border-t border-smoke flex items-center justify-between gap-4">
            <div className="text-[11px] font-mono text-slate flex items-center gap-1.5 max-w-sm">
              <Info className="h-4 w-4 text-steel flex-shrink-0 stroke-[1.5]" /> 
              Items pass automated cache validation scans before entering the public index matrix.
            </div>
            <Button
              type="submit"
              className="px-8 py-4 font-mono text-xs uppercase tracking-wider font-bold rounded-none shadow-sm"
              disabled={isPending}
            >
              {isPending ? 'Serializing Form...' : 'Publish Live Listing'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}