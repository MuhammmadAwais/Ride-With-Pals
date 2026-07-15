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
import { toast } from "sonner";
import { NewsService, RideService } from "@/api/backendApi";

export const NewsAdded = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    
    setLoading(true);
    try {
      const clubId = localStorage.getItem("selectedClubId");
      if (!clubId) {
        toast.error("No club selected.");
        return;
      }
      
      let imageUrl = "";
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await RideService.uploadFile(formData);
        imageUrl = uploadRes?.url || uploadRes?.data?.url || uploadRes?.fileName || uploadRes?.response?.url || "";
      }
      
      await NewsService.addNews({
        title,
        description,
        clubId: Number(clubId),
        newsImage: imageUrl
      });
      
      toast.success("News published successfully!");
      navigate("/view/clubside/news");
    } catch (error) {
      console.error("Failed to add news:", error);
      toast.error("Failed to publish news.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-text-main bg-main-bg p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 p-6 border border-border rounded-3xl backdrop-blur-sm bg-surface shadow-lg">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-text-main">
            Add News
          </h1>
          <p className="text-text-muted text-sm font-medium">
            Configure new system bulletin or market update
          </p>
        </div>

        <div className="flex items-center gap-6 px-5 py-2.5 bg-main-bg rounded-2xl border border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <p className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
              System Ready
            </p>
          </div>
          <div className="h-4 w-[1px] bg-border" />
          <p className="text-[10px] text-text-muted font-mono font-bold">
            INST_V.82.0
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Title Input */}
          <div className="group bg-surface border border-border hover:border-[#EB712B]/30 rounded-3xl p-6 transition-all duration-300 shadow-lg">
            <label className="block text-[12px] font-bold uppercase tracking-[0.15em] mb-4 text-text-muted group-hover:text-text-main transition-colors duration-300">
              News Title
            </label>
            <input
              type="text"
              placeholder="Enter headline..."
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-text-muted font-medium text-text-main transition-all duration-300"
            />
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
              <span className="text-[10px] text-text-muted font-bold tracking-[0.1em]">
                Mandatory institutional field
              </span>
              <span className="text-[9px] text-text-muted font-mono font-bold">
                {title.length} / 120
              </span>
            </div>
          </div>

          {/* Description Editor */}
          <div className="group bg-surface border border-border hover:border-border rounded-3xl p-6 transition-all duration-300 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-main">
                Description
              </label>
              <div className="flex items-center justify-between sm:justify-end gap-6">
                <div className="flex gap-4 text-text-muted">
                  {[Bold, Italic, Link, List, Code].map((Icon, idx) => (
                    <button
                      key={idx}
                      className="hover:text-[#EB712B] transition-colors duration-200 cursor-pointer"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-48 md:h-64 bg-transparent outline-none text-sm md:text-base text-text-main placeholder:text-text-muted resize-none transition-all duration-300"
              placeholder="Compose detailed content..."
            ></textarea>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
              <span className="text-[9px] uppercase font-bold text-text-muted">
                Rich formatting enabled
              </span>
              <span className="text-[9px] text-text-muted font-bold uppercase">
                Word count: {description.trim().split(/\s+/).filter(w => w.length > 0).length}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upload Box */}
          <div className="bg-surface border border-border rounded-3xl p-6 transition-all duration-300 shadow-lg">
            <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-text-muted mb-6">
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
              className="relative border-2 border-dashed border-border rounded-2xl p-8 hover:border-[#EB712B]/50 hover:bg-[#EB712B]/[0.02] transition-all duration-300 cursor-pointer text-center overflow-hidden bg-main-bg"
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
                  <p className="text-sm font-bold text-text-main">
                    Drop media here
                  </p>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="mt-4 flex items-center gap-3 bg-main-bg p-2 pr-4 rounded-xl border border-border transition-colors">
                <div className="w-10 h-10 bg-surface rounded-lg border border-border flex items-center justify-center">
                  <FileImage size={18} className="text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate text-text-main">
                    {selectedFile.name}
                  </p>
                  <p className="text-[9px] text-text-muted font-mono tracking-widest">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={handleDelete} 
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group cursor-pointer"
                >
                  <Trash2
                    size={14}
                    className="text-text-muted group-hover:text-red-500 transition-colors"
                  />
                </button>
              </div>
            )}
          </div>

          {/* Action Box */}
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-lg">
            <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-text-main mb-6">
              Publication Action
            </label>

            <button
              onClick={handleSave}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(235,113,43,0.3)] ${
                loading ? "bg-gray-500 cursor-not-allowed" : "bg-[#EB712B] hover:shadow-[0_0_30px_rgba(235,113,43,0.5)] active:scale-[0.98] cursor-pointer"
              }`}
            >
              {loading ? "Publishing..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
