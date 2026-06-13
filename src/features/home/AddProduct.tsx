import React from 'react';
import { Upload, ChevronDown, ArrowLeft, LayoutDashboard, FileText, DollarSign, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors text-xs font-bold mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Registry
          </button>
          <h1 className="text-3xl font-black tracking-tight">Add New Product</h1>
          <p className="text-zinc-400 mt-2">Fill in the product specifications to list your new item in the marketplace.</p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Area (Left) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Media */}
            <div className="bg-[#111111] p-8 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <LayoutDashboard size={20} className="text-orange-500" /> Product Media
              </h2>
              <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center hover:border-orange-500/50 transition-colors cursor-pointer bg-[#0c0c0c]">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                  <Upload className="text-orange-500" size={24} />
                </div>
                <p className="text-sm font-bold">Click or drag files here</p>
                <p className="text-xs text-zinc-500 mt-2">Supports MP4, PNG, JPG (Max 10MB)</p>
              </div>
            </div>

            {/* General Info */}
            <div className="bg-[#111111] p-8 rounded-3xl border border-zinc-800 shadow-xl">
              <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
                <FileText size={20} className="text-orange-500" /> General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-3 block">Product Name</label>
                  <input type="text" className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-xl p-4 text-sm focus:outline-none focus:border-orange-500" placeholder="e.g. Ember Series X1" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-3 block">Price</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-4.5 text-zinc-600" />
                    <input type="text" className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-xl p-4 pl-10 text-sm focus:outline-none focus:border-orange-500" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-3 block">Size Category</label>
                  <div className="relative">
                    <select className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-xl p-4 text-sm appearance-none focus:outline-none focus:border-orange-500">
                      <option>XL - Extra Large</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-4.5 text-zinc-600" size={16} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-3 block">Gender</label>
                  <div className="relative">
                    <select className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-xl p-4 text-sm appearance-none focus:outline-none focus:border-orange-500">
                      <option>None</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-4.5 text-zinc-600" size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-[#111111] p-6 rounded-3xl border border-zinc-800 sticky top-8">
              <h3 className="font-bold mb-4 text-sm">Actions</h3>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-sm mb-3 transition-transform active:scale-95">
                Publish Product
              </button>
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl font-bold text-sm transition-colors">
                Save as Draft
              </button>
            </div>

            {/* Helper Info */}
            <div className="bg-[#111111] p-6 rounded-3xl border border-zinc-800">
              <h3 className="font-bold mb-4 text-sm flex items-center gap-2">
                <Tag size={16} className="text-orange-500"/> Best Practices
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                High-quality product images increase conversion rates by up to 40%. Ensure your imagery is consistent with brand guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;