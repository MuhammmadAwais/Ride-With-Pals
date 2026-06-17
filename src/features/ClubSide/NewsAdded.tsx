import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bold,
  Italic,
  Link,
  List,
  Code,
  UploadCloud,
  Trash2,
  FileImage,
} from "lucide-react";

export const NewsAdded = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDelete = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 p-6  border border-white/[0.05] rounded-3xl backdrop-blur-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white">
            Add News
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Configure new system bulletin or market update
          </p>
        </div>

        <div className="flex items-center gap-6 px-5 py-2.5 bg-[#050505] rounded-2xl border border-white/[0.03]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <p className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
              System Ready
            </p>
          </div>
          <div className="h-4 w-[1px] bg-white/[0.05]" />
          <p className="text-[10px] text-gray-600 font-mono font-bold">
            INST_V.82.0
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1  lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Title Input */}
          <div className="group  border border-white/[0.03] hover:border-[#EB712B]/30 rounded-3xl p-6 transition-all duration-300">
            <label className="block text-[12px] font-bold uppercase tracking-[0.15em] mb-4  group-hover:text-white transition-colors duration-300">
              News Title
            </label>
            <input
              type="text"
              placeholder="Enter headline..."
              maxLength={120}
              className="w-full bg-transparentoutline-none placeholder:text-[#686666] font-medium text-white transition-all duration-300"
            />
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/[0.03]">
              <span className="text-[10px]  font-bold tracking-[0.1em]">
                Mandatory institutional field
              </span>
              <span className="text-[9px] text-[#333] font-mono font-bold">
                0 / 120
              </span>
            </div>
          </div>

          {/* Description Editor */}
          <div className="group border border-white/[0.03] hover:border-white/[0.08] rounded-3xl p-6 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] ">
                Description
              </label>
              <div className="flex items-center justify-between sm:justify-end gap-6">
                <div className="flex gap-4 text-gray-600">
                  {[Bold, Italic, Link, List, Code].map((Icon, idx) => (
                    <button
                      key={idx}
                      className="hover:text-[#EB712B] transition-colors duration-200"
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
                <span className="hidden sm:block text-[9px] text-[#EB712B] font-bold uppercase tracking-[0.1em]">
                  Auto-save active
                </span>
              </div>
            </div>
            <textarea
              className="w-full h-48 md:h-64 bg-transparent outline-none text-sm md:text-base text-gray-400 placeholder:text-[#888888] resize-none transition-all duration-300 focus:text-white"
              placeholder="Compose detailed content..."
            ></textarea>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.03]">
              <span className="text-[9px] uppercase font-bold ">
                Rich formatting enabled
              </span>
              <span className="text-[9px] text-[#333] font-bold uppercase">
                Word count: 0
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upload Box */}
          <div className="bg-[#0c0c0c] border border-white/[0.03] rounded-3xl p-6 transition-all duration-300">
            <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-6">
              Upload Picture
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/jpeg,image/png"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-white/[0.05] rounded-2xl p-8 hover:border-[#EB712B]/50 hover:bg-[#EB712B]/[0.02] transition-all duration-300 cursor-pointer text-center overflow-hidden"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3">
                  <UploadCloud className="text-[#EB712B]" size={32} />
                  <p className="text-sm font-bold text-gray-200">
                    Drop media here
                  </p>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="mt-4 flex items-center gap-3 bg-[#0a0a0a] p-2 pr-4 rounded-xl border border-white/[0.03] hover:border-white/[0.08] transition-colors">
                <div className="w-10 h-10 bg-[#161616] rounded-lg border border-white/[0.05] flex items-center justify-center">
                  <FileImage size={18} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[9px] text-gray-500 font-mono tracking-widest">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={handleDelete} 
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                >
                  <Trash2
                    size={14}
                    className="text-gray-600 group-hover:text-red-500 transition-colors"
                  />
                </button>
              </div>
            )}
          </div>

          {/* Action Box */}
          <div className="border border-white/[0.05] rounded-3xl p-6">
            <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-100 mb-6">
              Publication Action
            </label>

            <button
              onClick={() => navigate("/dashboard/news")} // Change this to the full path
              className="w-full flex items-center justify-center gap-2 bg-[#EB712B]  text-White font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(235,113,43,0.3)] active:scale-[0.98]"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
