import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAddDiscountMutation } from '@/features/club/api/discountApiSlice';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';

function AddDiscount() {
  const navigate = useNavigate();
  const { clubId: clubIdStr } = useActiveClub();
  const permissions = useClubPermissions(clubIdStr || undefined);
  
  if (!permissions.isLoading && !permissions.canPublishDiscount) {
    return (
      <div className="p-10 min-h-screen text-text-main bg-main-bg flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-black mb-4">Access Denied</h1>
        <p className="text-text-muted max-w-md mb-6">
          You do not have the required permissions to publish or manage discounts for this club.
        </p>
        <button 
          onClick={() => navigate('/view/clubside/discount')} 
          className="px-6 py-3 bg-[#EB712B] hover:bg-[#ff8243] text-white rounded-xl font-bold transition-all cursor-pointer border-0"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  const [formData, setFormData] = useState({
    title: '',
    percentage: '',
    description: '',
    code: '',
    validTill: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addDiscount, { isLoading: loading }] = useAddDiscountMutation();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    (document.activeElement as HTMLElement)?.blur();
    let newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Discount title is required";
    if (!formData.code.trim()) newErrors.code = "Discount code is required";
    if (!formData.percentage) newErrors.percentage = "Percentage is required";
    if (!formData.validTill) newErrors.validTill = "Valid till date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    if (!clubIdStr) {
      toast.error("No club selected. Please select a club first.");
      return;
    }

    try {
      await addDiscount({
        clubId: Number(clubIdStr),
        title: formData.title.trim(),
        discountCode: formData.code.trim(),
        discountPercentage: Number(formData.percentage),
        description: formData.description.trim(),
        validTill: new Date(formData.validTill).toISOString(),
        isActive: true
      }).unwrap();
      
      toast.success("Discount code created successfully!");
      navigate('/view/clubside/discount');
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create discount");
      console.error(err);
      setErrors({ global: err?.data?.message || "Failed to create discount" });
    }
  };

  return (
    <div className="p-10 min-h-screen text-text-main bg-main-bg">
      <button 
        onClick={() => navigate('/view/clubside/discount')} 
        className="flex items-center gap-2 text-text-muted hover:text-[#EB712B] transition-colors mb-6 text-sm font-bold uppercase tracking-widest bg-transparent border-0 outline-none cursor-pointer"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black mb-8">Add New Discount</h1>

        <form onSubmit={handleSave} className="bg-surface border border-border rounded-[32px] p-10 shadow-2xl">
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
            type="submit"
            disabled={loading}
            className={`w-full h-16 mt-8 rounded-2xl ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#EB712B] hover:bg-[#ff8243]'} text-white font-black text-sm uppercase transition-all cursor-pointer border-0 outline-none flex items-center justify-center gap-2`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddDiscount;
