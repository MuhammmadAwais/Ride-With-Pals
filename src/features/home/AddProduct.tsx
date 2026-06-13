import React, { useState, useRef } from 'react';
import { Upload, ChevronDown, ArrowLeft, LayoutDashboard, FileText, DollarSign, Tag, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize state with the passed image (if any)
  const [selectedImage, setSelectedImage] = useState<string | null>(location.state?.imageUrl || null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setSelectedImage(objectUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors text-xs font-bold mb-6">
            <ArrowLeft size={16} /> Back to Registry
          </button>
          <h1 className="text-3xl font-black tracking-tight">Add New Product</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Product Media Section */}
            <div className="bg-[#111111] p-8 rounded-3xl border border-zinc-800 shadow-xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <LayoutDashboard size={20} className="text-orange-500" /> Product Media
              </h2>
              
              {selectedImage ? (
                <div className="relative w-full h-[400px] rounded-2xl border border-zinc-800 bg-[#0c0c0c] flex items-center justify-center overflow-hidden">
                  <img src={selectedImage} alt="Product" className="max-w-full max-h-full object-contain p-4" />
                  <button 
                    onClick={() => setSelectedImage(null)} 
                    className="absolute top-4 right-4 bg-black/60 p-2 rounded-full hover:bg-black transition-colors"
                  >
                    <X size={18} className="text-white" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center cursor-pointer bg-[#0c0c0c] hover:border-orange-500/50 transition-colors"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <Upload className="text-orange-500 mb-4" size={24} />
                  <p className="text-sm font-bold">Click or drag files here</p>
                  <p className="text-xs text-zinc-500 mt-2">Supports MP4, PNG, JPG (Max 10MB)</p>
                </div>
              )}
            </div>

            {/* General Info */}
            <div className="bg-[#111111] p-8 rounded-3xl border border-zinc-800">
               <h2 className="text-lg font-bold mb-8 flex items-center gap-2"><FileText size={20} className="text-orange-500" /> General Information</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Input fields... */}
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#111111] p-6 rounded-3xl border border-zinc-800">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-sm mb-3">Publish Product</button>
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl font-bold text-sm">Save as Draft</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;