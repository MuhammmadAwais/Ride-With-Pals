import React, { useState, useRef, useEffect } from 'react';
import { Upload, ArrowLeft, LayoutDashboard, FileText, Eye, ShieldCheck, RefreshCcw, Settings, Gauge, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';


const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const incomingProduct = location.state?.product;

  // State
  const [name, setName] = useState(incomingProduct?.name || '');
  const [price, setPrice] = useState(incomingProduct?.price || '');
  const [description, setDescription] = useState(incomingProduct?.description || '');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    if (incomingProduct) {
      setSelectedImages(incomingProduct.gallery || (incomingProduct.image ? [incomingProduct.image] : []));
    }
  }, [incomingProduct]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...newImages].slice(0, 3));
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

 const handleUpdate = () => {
  const saved = localStorage.getItem('myProducts');
  const productList = saved ? JSON.parse(saved) : [];
  
  const updatedList = productList.map((p: any) => 
    p.id === incomingProduct.id 
      ? { ...p, name, price, description, gallery: selectedImages, image: selectedImages[0] } 
      : p
  );
  
  localStorage.setItem('myProducts', JSON.stringify(updatedList));
  
  // Update this line to match your router path:
  navigate('/dashboard/product'); 
};

  return (
    <div className="min-h-screen  text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#111111] p-8 rounded-2xl border border-zinc-800 mb-8 flex justify-between items-start">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-orange-500 text-[10px] font-bold uppercase mb-3 hover:opacity-80 tracking-widest">
              <ArrowLeft size={14} /> Back to Inventory
            </button>
            <h1 className="text-3xl font-black text-white mb-2">{incomingProduct ? 'Edit your product' : 'Add New Product'}</h1>
            <p className="text-zinc-500 text-sm max-w-lg">List a new high-performance asset to the elite inventory.</p>
          </div>
          <div className="flex gap-3 mt-8">
            <button className="bg-transparent border border-zinc-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-zinc-900 transition-all">Save as Draft</button>
            <button onClick={handleUpdate} className="bg-[#EB712B] text-white px-6 py-2.5 rounded-lg font-bold text-sm  transition-all">
              {incomingProduct ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2"><LayoutDashboard size={18} className="text-orange-500" /> Product Media</h2>
              <div className="grid grid-cols-3 gap-4">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative h-32 border border-zinc-800 rounded-xl overflow-hidden bg-[#0c0c0c] flex items-center justify-center">
                    <img src={img} alt="Product" className="max-h-full object-contain" />
                    <button onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"><X size={14} /></button>
                  </div>
                ))}
                {selectedImages.length < 3 && (
                  <div onClick={() => fileInputRef.current?.click()} className="h-32 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center cursor-pointer">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                    <Upload className="text-orange-500 mb-2" size={20} />
                    <span className="text-[10px] text-zinc-500 font-bold">Add Image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-sm font-bold mb-6 flex items-center gap-2"><FileText size={18} className="text-orange-500" /> Technical Specifications</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-zinc-500">Product Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0c0c0c] border border-zinc-800 rounded-lg p-3 mt-1 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Price (USD)</label>
                  <input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-[#0c0c0c] border border-zinc-800 rounded-lg p-3 mt-1 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-zinc-500">Size</label>
                  <select className="w-full bg-[#0c0c0c] border border-zinc-800 rounded-lg p-3 mt-1 text-sm text-white">
                    <option>XL - Extra Large</option><option>L - Large</option><option>M - Medium</option><option>S - Small</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Gender (optional)</label>
                  <select className="w-full bg-[#0c0c0c] border border-zinc-800 rounded-lg p-3 mt-1 text-sm text-white">
                    <option>None</option><option>Male</option><option>Female</option><option>Unisex</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-[#0c0c0c] border border-zinc-800 rounded-lg p-3 mt-1 text-sm" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-sm font-bold mb-6 text-white">Elite Listing Tips</h2>
              <div className="space-y-6">
                <div className="flex gap-3"><ShieldCheck size={20} className="text-orange-500/80" /><div><h3 className="text-xs font-bold text-white">Precision Data</h3><p className="text-[10px] text-zinc-500">Accurate sizes reduce return rates.</p></div></div>
                <div className="flex gap-3"><Eye size={20} className="text-orange-500/80" /><div><h3 className="text-xs font-bold text-white">Visual Clarity</h3><p className="text-[10px] text-zinc-500">Use consistent inventory aesthetics.</p></div></div>
                <div className="flex gap-3"><Gauge size={20} className="text-orange-500/80" /><div><h3 className="text-xs font-bold text-white">SEO Keywords</h3><p className="text-[10px] text-zinc-500">Include technical terms.</p></div></div>
              </div>
            </div>

            {/* Configuration & Logistics */}
            <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-sm font-bold mb-6 flex items-center gap-2"><Settings size={18} /> Configuration & Logistics</h2>
              <div className="mb-4">
                <label className="text-xs text-zinc-500">SKU Generation</label>
                <div className="relative mt-1">
                  <input defaultValue="EP-ELITE-2024-AUTO" className="w-full bg-[#0c0c0c] border border-zinc-800 rounded-lg p-3 text-sm" />
                  <RefreshCcw className="absolute right-3 top-3 text-zinc-500 cursor-pointer" size={16} />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-zinc-500">Tax Category</label>
                <select className="w-full bg-[#0c0c0c] border border-zinc-800 rounded-lg p-3 mt-1 text-sm text-white">
                  <option>Standard</option><option>Reduced</option><option>Exempt</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500">Warehouse Zone</label>
                <select className="w-full bg-[#0c0c0c] border border-zinc-800 rounded-lg p-3 mt-1 text-sm text-white">
                  <option>Alpha Sector</option><option>Beta Sector</option><option>Gamma Sector</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;