import React, { useState, useRef, useEffect } from 'react';
import { Upload, ArrowLeft, LayoutDashboard, FileText, Eye, ShieldCheck, RefreshCcw, Settings, Gauge, X, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAddItemToShopMutation, useUpdateItemToShopMutation } from '@/features/club/api/shopApiSlice';
import { useUploadFileMutation } from '@/features/auth/api/authApiSlice';

const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const incomingProduct = location.state?.product;

  // Form state
  const [name, setName] = useState(incomingProduct?.name || '');
  const [price, setPrice] = useState(incomingProduct?.price || '');
  const [description, setDescription] = useState(incomingProduct?.description || '');
  const [size, setSize] = useState(incomingProduct?.size || 'XL');
  const [gender, setGender] = useState(incomingProduct?.gender || 'None');

  // Image state: existing gallery string URLs + pending File objects for new uploads
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // RTK mutations
  const [addItem, { isLoading: isAdding }] = useAddItemToShopMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemToShopMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const isLoading = isAdding || isUpdating || isUploading;

  useEffect(() => {
    if (incomingProduct) {
      const existingImages = incomingProduct.gallery || (incomingProduct.image ? [incomingProduct.image] : []);
      setPreviewImages(existingImages);
    }
  }, [incomingProduct]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const fileArray = Array.from(files).slice(0, 3 - previewImages.length);
    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews].slice(0, 3));
    setPendingFiles((prev) => [...prev, ...fileArray].slice(0, 3));
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const clubIdStr = localStorage.getItem('selectedClubId');
    if (!clubIdStr) {
      toast.error('No club selected. Please select a club first.');
      return;
    }
    if (!name.trim()) {
      toast.error('Product name is required.');
      return;
    }

    try {
      // Upload any pending new image files first
      let finalImageUrl: string | undefined;
      if (pendingFiles.length > 0) {
        const formData = new FormData();
        formData.append('file', pendingFiles[0]);
        const uploadRes = await uploadFile(formData).unwrap();
        finalImageUrl = uploadRes.fileName;
      } else if (previewImages.length > 0) {
        // Keep existing image if no new upload
        finalImageUrl = previewImages[0];
      }

      if (incomingProduct) {
        // UPDATE existing product
        await updateItem({
          shopItemId: incomingProduct.id,
          name: name.trim(),
          price: Number(price) || 0,
          description: description.trim(),
          size,
          gender: gender === 'None' ? undefined : gender,
          image: finalImageUrl,
        }).unwrap();
        toast.success('Product updated successfully!');
      } else {
        // CREATE new product
        await addItem({
          clubId: Number(clubIdStr),
          name: name.trim(),
          price: Number(price) || 0,
          description: description.trim(),
          size,
          gender: gender === 'None' ? undefined : gender,
          image: finalImageUrl,
        }).unwrap();
        toast.success('Product published successfully!');
      }

      navigate('/dashboard/product');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen text-text-main p-6 md:p-12 font-sans bg-main-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-surface p-8 rounded-2xl border border-border mb-8 flex justify-between items-start shadow-xl">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#EB712B] text-[10px] font-bold uppercase mb-3 hover:opacity-80 tracking-widest cursor-pointer">
              <ArrowLeft size={14} /> Back to Inventory
            </button>
            <h1 className="text-3xl font-black text-text-main mb-2">{incomingProduct ? 'Edit your product' : 'Add New Product'}</h1>
            <p className="text-text-muted text-sm max-w-lg">List a new high-performance asset to the elite inventory.</p>
          </div>
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => navigate(-1)}
              disabled={isLoading}
              className="bg-transparent border border-border text-text-main px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-hover transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-[#EB712B] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer disabled:opacity-70 flex items-center gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? 'Saving...' : incomingProduct ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Media */}
            <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-text-main"><LayoutDashboard size={18} className="text-[#EB712B]" /> Product Media</h2>
              <div className="grid grid-cols-3 gap-4">
                {previewImages.map((img, index) => (
                  <div key={index} className="relative h-32 border border-border rounded-xl overflow-hidden bg-main-bg flex items-center justify-center">
                    <img src={img} alt="Product" className="max-h-full object-contain" />
                    <button onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full cursor-pointer text-white"><X size={14} /></button>
                  </div>
                ))}
                {previewImages.length < 3 && (
                  <div onClick={() => fileInputRef.current?.click()} className="h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#EB712B]/50 transition-colors">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                    {isUploading ? (
                      <Loader2 className="text-[#EB712B] animate-spin mb-2" size={20} />
                    ) : (
                      <Upload className="text-[#EB712B] mb-2" size={20} />
                    )}
                    <span className="text-[10px] text-text-muted font-bold">{isUploading ? 'Uploading...' : 'Add Image'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg">
              <h2 className="text-sm font-bold mb-6 flex items-center gap-2 text-text-main"><FileText size={18} className="text-[#EB712B]" /> Technical Specifications</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-text-muted font-bold uppercase">Product Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-main-bg border border-border rounded-lg p-3 mt-1 text-sm outline-none focus:border-[#EB712B] text-text-main" />
                </div>
                <div>
                  <label className="text-xs text-text-muted font-bold uppercase">Price (USD)</label>
                  <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" className="w-full bg-main-bg border border-border rounded-lg p-3 mt-1 text-sm outline-none focus:border-[#EB712B] text-text-main" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-text-muted font-bold uppercase">Size</label>
                  <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-main-bg border border-border rounded-lg p-3 mt-1 text-sm text-text-main outline-none focus:border-[#EB712B]">
                    <option>XL - Extra Large</option><option>L - Large</option><option>M - Medium</option><option>S - Small</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted font-bold uppercase">Gender (optional)</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-main-bg border border-border rounded-lg p-3 mt-1 text-sm text-text-main outline-none focus:border-[#EB712B]">
                    <option>None</option><option>Male</option><option>Female</option><option>Unisex</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted font-bold uppercase">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-main-bg border border-border rounded-lg p-3 mt-1 text-sm outline-none focus:border-[#EB712B] text-text-main resize-none" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg">
              <h2 className="text-sm font-bold mb-6 text-text-main">Elite Listing Tips</h2>
              <div className="space-y-6">
                <div className="flex gap-3"><ShieldCheck size={20} className="text-[#EB712B]/80" /><div><h3 className="text-xs font-bold text-text-main">Precision Data</h3><p className="text-[10px] text-text-muted">Accurate sizes reduce return rates.</p></div></div>
                <div className="flex gap-3"><Eye size={20} className="text-[#EB712B]/80" /><div><h3 className="text-xs font-bold text-text-main">Visual Clarity</h3><p className="text-[10px] text-text-muted">Use consistent inventory aesthetics.</p></div></div>
                <div className="flex gap-3"><Gauge size={20} className="text-[#EB712B]/80" /><div><h3 className="text-xs font-bold text-text-main">SEO Keywords</h3><p className="text-[10px] text-text-muted">Include technical terms.</p></div></div>
              </div>
            </div>

            {/* Configuration & Logistics */}
            <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg">
              <h2 className="text-sm font-bold mb-6 flex items-center gap-2 text-text-main"><Settings size={18} className="text-[#EB712B]" /> Configuration & Logistics</h2>
              <div className="mb-4">
                <label className="text-xs text-text-muted font-bold uppercase">SKU Generation</label>
                <div className="relative mt-1">
                  <input defaultValue="EP-ELITE-2024-AUTO" className="w-full bg-main-bg border border-border rounded-lg p-3 text-sm outline-none focus:border-[#EB712B] text-text-main" />
                  <RefreshCcw className="absolute right-3 top-3 text-text-muted cursor-pointer hover:text-[#EB712B]" size={16} />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-text-muted font-bold uppercase">Tax Category</label>
                <select className="w-full bg-main-bg border border-border rounded-lg p-3 mt-1 text-sm text-text-main outline-none focus:border-[#EB712B]">
                  <option>Standard</option><option>Reduced</option><option>Exempt</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted font-bold uppercase">Warehouse Zone</label>
                <select className="w-full bg-main-bg border border-border rounded-lg p-3 mt-1 text-sm text-text-main outline-none focus:border-[#EB712B]">
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
