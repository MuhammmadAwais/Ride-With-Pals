import React, { useState, useRef, useEffect } from 'react';
import { Upload, ArrowLeft, LayoutDashboard, FileText, CheckCircle2, X, Loader2, Package, Tag, DollarSign, Layers, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAddItemToShopMutation, useUpdateItemToShopMutation } from '@/features/club/api/shopApiSlice';
import { useUploadFileMutation } from '@/features/auth/api/authApiSlice';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import { ROUTES } from '@/Constants';

const AddProduct = () => {
  const navigate = useNavigate();
  const { clubId: clubIdStr } = useActiveClub();
  const permissions = useClubPermissions(clubIdStr || undefined);

  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const incomingProduct = location.state?.product;

  // Form state
  const [name, setName] = useState(incomingProduct?.name || '');
  const [price, setPrice] = useState(incomingProduct?.price || '');
  const [description, setDescription] = useState(incomingProduct?.description || '');
  const [size, setSize] = useState(incomingProduct?.size || 'L');
  const [gender, setGender] = useState(incomingProduct?.gender || 'Unisex');

  // Image state
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
    if (!clubIdStr) {
      toast.error('No club selected. Please select an active club first.');
      return;
    }
    if (!name.trim()) {
      toast.error('Please provide a product name.');
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error('Please provide a valid unit price.');
      return;
    }

    try {
      let finalImageUrl: string | undefined;
      if (pendingFiles.length > 0) {
        const formData = new FormData();
        formData.append('file', pendingFiles[0]);
        const uploadRes = await uploadFile(formData).unwrap();
        finalImageUrl = uploadRes.fileName;
      } else if (previewImages.length > 0) {
        finalImageUrl = previewImages[0];
      }

      if (incomingProduct) {
        await updateItem({
          shopItemId: incomingProduct.id,
          name: name.trim(),
          price: Number(price),
          description: description.trim(),
          size,
          gender: gender === 'None' ? undefined : gender,
          image: finalImageUrl,
        }).unwrap();
        toast.success('Product updated successfully!');
      } else {
        await addItem({
          clubId: Number(clubIdStr),
          name: name.trim(),
          price: Number(price),
          description: description.trim(),
          size,
          gender: gender === 'None' ? undefined : gender,
          image: finalImageUrl,
        }).unwrap();
        toast.success('Product added to club shop!');
      }

      navigate(ROUTES.PRODUCT);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save product. Please check your inputs.');
    }
  };

  if (!permissions.isLoading && !permissions.isAdmin) {
    return (
      <div className="p-10 min-h-screen text-text-main bg-main-bg flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-black mb-4">Access Denied</h1>
        <p className="text-text-muted max-w-md mb-6">
          Only club administrators and organizers can manage merchandise products for this club.
        </p>
        <button 
          onClick={() => navigate(ROUTES.PRODUCT)} 
          className="px-6 py-3 bg-[#EB712B] hover:bg-[#ff8243] text-white rounded-xl font-bold transition-all cursor-pointer border-0"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-text-main p-6 md:p-12 font-sans bg-main-bg">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-surface p-6 md:p-8 rounded-3xl border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <button 
              onClick={() => navigate(ROUTES.PRODUCT)} 
              className="flex items-center gap-2 text-[#EB712B] text-xs font-bold uppercase mb-2 hover:opacity-80 tracking-widest cursor-pointer bg-transparent border-0 outline-none"
            >
              <ArrowLeft size={16} /> Back to Shop Inventory
            </button>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {incomingProduct ? 'Edit Shop Item' : 'Add Shop Item'}
            </h1>
            <p className="text-text-muted text-xs md:text-sm mt-1">
              List and manage official merchandise for your club members.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(ROUTES.PRODUCT)}
              disabled={isLoading}
              className="bg-transparent border border-border text-text-main px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-hover transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-[#EB712B] hover:bg-[#ff8243] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer disabled:opacity-70 flex items-center gap-2 border-0 shadow-lg shadow-[#EB712B]/20"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? 'Saving...' : incomingProduct ? 'Update Product' : 'Publish to Shop'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Media Dropzone */}
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-lg space-y-4">
              <h2 className="text-sm font-bold flex items-center gap-2 text-white">
                <LayoutDashboard size={18} className="text-[#EB712B]" /> Product Media
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {previewImages.map((img, index) => (
                  <div key={index} className="relative aspect-square border border-border rounded-2xl overflow-hidden bg-main-bg flex items-center justify-center group">
                    <img src={img} alt="Product" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(index)} 
                      className="absolute top-2 right-2 bg-black/70 hover:bg-red-500 p-1.5 rounded-xl cursor-pointer text-white transition-colors border-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {previewImages.length < 3 && (
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="aspect-square border-2 border-dashed border-[#EB712B]/40 hover:border-[#EB712B] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#EB712B]/5 transition-all p-4 text-center bg-main-bg/50"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      multiple 
                      accept="image/*" 
                    />
                    {isUploading ? (
                      <Loader2 className="text-[#EB712B] animate-spin mb-2" size={24} />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#EB712B]/10 flex items-center justify-center text-[#EB712B] mb-2">
                        <Upload size={20} />
                      </div>
                    )}
                    <span className="text-xs font-bold text-white">
                      {isUploading ? 'Uploading...' : 'Upload Image'}
                    </span>
                    <span className="text-[10px] text-text-muted mt-1">PNG, JPG up to 10MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-lg space-y-6">
              <h2 className="text-sm font-bold flex items-center gap-2 text-white">
                <FileText size={18} className="text-[#EB712B]" /> Item Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-text-muted font-bold uppercase tracking-wider block">
                    Product Name *
                  </label>
                  <input 
                    type="text"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. Official Team Jersey 2026"
                    className="w-full h-12 bg-main-bg border border-border rounded-xl px-4 text-sm outline-none focus:border-[#EB712B] text-white placeholder:text-text-muted/40 transition-colors" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-text-muted font-bold uppercase tracking-wider block">
                    Price ($) *
                  </label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    placeholder="e.g. 45.00"
                    className="w-full h-12 bg-main-bg border border-border rounded-xl px-4 text-sm outline-none focus:border-[#EB712B] text-white placeholder:text-text-muted/40 transition-colors" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-text-muted font-bold uppercase tracking-wider block">
                    Size / Dimension
                  </label>
                  <select 
                    value={size} 
                    onChange={(e) => setSize(e.target.value)} 
                    className="w-full h-12 bg-main-bg border border-border rounded-xl px-4 text-sm text-white outline-none focus:border-[#EB712B] transition-colors cursor-pointer"
                  >
                    <option value="XS">XS - Extra Small</option>
                    <option value="S">S - Small</option>
                    <option value="M">M - Medium</option>
                    <option value="L">L - Large</option>
                    <option value="XL">XL - Extra Large</option>
                    <option value="XXL">XXL - Double Extra Large</option>
                    <option value="One Size">One Size Fits All</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-text-muted font-bold uppercase tracking-wider block">
                    Target Gender
                  </label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)} 
                    className="w-full h-12 bg-main-bg border border-border rounded-xl px-4 text-sm text-white outline-none focus:border-[#EB712B] transition-colors cursor-pointer"
                  >
                    <option value="Unisex">Unisex / Universal</option>
                    <option value="Male">Men's Apparel</option>
                    <option value="Female">Women's Apparel</option>
                    <option value="None">Not Applicable</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text-muted font-bold uppercase tracking-wider block">
                  Description
                </label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={4} 
                  placeholder="Provide fabric composition, sizing fit guidelines, care instructions, or delivery details..."
                  className="w-full bg-main-bg border border-border rounded-xl p-4 text-sm outline-none focus:border-[#EB712B] text-white placeholder:text-text-muted/40 transition-colors resize-none" 
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Store Card Preview */}
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-lg space-y-4 sticky top-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Sparkles size={14} className="text-[#EB712B]" /> Member View Preview
                </h3>
                <span className="text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full">
                  Official Merch
                </span>
              </div>

              {/* Preview Card */}
              <div className="bg-main-bg border border-border rounded-2xl overflow-hidden p-4 space-y-4">
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-surface border border-border flex items-center justify-center">
                  {previewImages[0] ? (
                    <img src={previewImages[0]} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-text-muted gap-2">
                      <Package size={32} className="text-[#EB712B]/40" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Item Image</span>
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase border border-white/10">
                    {size}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                      {gender !== 'None' ? gender : 'Gear'}
                    </span>
                    <span className="text-xs font-black text-emerald-400">● In Stock</span>
                  </div>
                  <h4 className="text-base font-black text-white truncate">
                    {name || 'Product Title'}
                  </h4>
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {description || 'Product description will appear here for club members browsing the shop.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-text-muted block">Price</span>
                    <span className="text-lg font-black text-[#EB712B]">
                      ${price ? Number(price).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-[#EB712B]/20 text-[#EB712B] text-xs font-bold uppercase tracking-wider border border-[#EB712B]/30">
                    Club Store
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
