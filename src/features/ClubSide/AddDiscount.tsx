import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ShopService } from '@/api/backendApi';

function AddDiscount() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    percentage: '',
    description: '',
    code: '',
    validTill: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (loading) return;
    (document.activeElement as HTMLElement)?.blur();
    let newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = "Discount title is required";
    if (!formData.code) newErrors.code = "Discount code is required";
    if (!formData.percentage) newErrors.percentage = "Percentage is required";
    if (!formData.validTill) newErrors.validTill = "Valid till date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    const clubIdStr = localStorage.getItem("selectedClubId");
    if (!clubIdStr) return;

    setLoading(true);
    try {
      await ShopService.addDiscount({
        clubId: Number(clubIdStr),
        title: formData.title,
        discountCode: formData.code,
        discountPercentage: Number(formData.percentage),
        description: formData.description,
        validTill: new Date(formData.validTill).toISOString(),
        isActive: true
      });
      navigate('/dashboard/discount');
    } catch (err) {
      console.error(err);
      setErrors({ global: "Failed to create discount" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 min-h-screen text-text-main bg-main-bg">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-[#EB712B] transition-colors mb-6 text-sm font-bold uppercase tracking-widest">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black mb-8">Add New Discount</h1>

        <div className="bg-surface border border-border rounded-[32px] p-10 shadow-2xl">
          {errors.global && <p className="text-[#EB712B] text-sm font-bold mb-4">{errors.global}</p>}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Column 1 */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs uppercase font-bold text-text-muted tracking-widest">DISCOUNT TITLE</label>
                <input 
                  placeholder="Enter title" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full h-14 bg-main-bg border rounded-2xl px-4 text-md outline-none focus:border-[#EB712B] text-text-main placeholder-text-muted ${errors.title ? 'border-[#EB712B]' : 'border-border'}`} 
                />
                {errors.title && <p className="text-[#EB712B] text-xs font-semibold">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs uppercase font-bold text-text-muted tracking-widest">PERCENTAGE</label>
                  <input 
                    placeholder="00" 
                    type="number"
                    value={formData.percentage}
                    onChange={(e) => setFormData({...formData, percentage: e.target.value})}
                    className="w-full h-14 bg-main-bg border border-border rounded-2xl px-4 text-md focus:border-[#EB712B] outline-none text-text-main placeholder-text-muted" 
                  />
                  {errors.percentage && <p className="text-[#EB712B] text-xs font-semibold">{errors.percentage}</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-xs uppercase font-bold text-text-muted tracking-widest">VALID TILL</label>
                  <input 
                    type="date"
                    style={{ colorScheme: 'dark' }}
                    value={formData.validTill}
                    onChange={(e) => setFormData({...formData, validTill: e.target.value})}
                    className="relative w-full h-14 bg-main-bg border border-border rounded-2xl px-4 text-md focus:border-[#EB712B] outline-none text-text-main placeholder-text-muted" 
                  />
                  {errors.validTill && <p className="text-[#EB712B] text-xs font-semibold">{errors.validTill}</p>}
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs uppercase font-bold text-text-muted tracking-widest">DESCRIPTION</label>
                <textarea 
                  placeholder="Details..." 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full h-[148px] bg-main-bg border border-border rounded-2xl p-4 text-md focus:border-[#EB712B] outline-none resize-none text-text-main placeholder-text-muted" 
                />
              </div>
            </div>

            {/* Full Width Bottom Row */}
            <div className="col-span-2 space-y-3">
              <label className="text-xs uppercase font-bold text-text-muted tracking-widest">DISCOUNT CODE</label>
              <input 
                placeholder="5457-5A" 
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className={`w-full h-14 bg-main-bg border rounded-2xl px-4 text-md outline-none focus:border-[#EB712B] text-text-main placeholder-text-muted ${errors.code ? 'border-[#EB712B]' : 'border-border'}`} 
              />
              {errors.code && <p className="text-[#EB712B] text-xs font-semibold">{errors.code}</p>}
            </div>
          </div>

          <button 
            onClick={handleSave}
            onMouseDown={handleSave}
            disabled={loading}
            className={`w-full h-16 mt-8 rounded-2xl ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#EB712B] hover:bg-[#ff8243]'} text-white font-black text-sm uppercase transition-all`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddDiscount;
