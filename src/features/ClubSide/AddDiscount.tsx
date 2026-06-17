import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function AddDiscount() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    percentage: '',
    amount: '',
    description: '',
    code: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    let newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = "Discount title is required";
    if (!formData.code) newErrors.code = "Discount code is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    navigate('/dashboard/discount');
  };

  return (
    <div className="p-10 min-h-screen text-white ">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#EB712B] transition-colors mb-6 text-sm font-bold uppercase tracking-widest">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black mb-8">Add New Discount</h1>

        <div className="bg-[#0c0c0c] border border-white/[0.05] rounded-[32px] p-10 shadow-2xl">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Column 1 */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs uppercase font-bold text-gray-500 tracking-widest">DISCOUNT TITLE</label>
                <input 
                  placeholder="Enter title" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full h-14 bg-[#050505] border rounded-2xl px-4 text-md outline-none focus:border-[#EB712B] ${errors.title ? 'border-[#EB712B]' : 'border-white/[0.05]'}`} 
                />
                {errors.title && <p className="text-[#EB712B] text-xs font-semibold">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs uppercase font-bold text-gray-500 tracking-widest">PERCENTAGE</label>
                  <input placeholder="00 %" className="w-full h-14 bg-[#050505] border border-white/[0.05] rounded-2xl px-4 text-md focus:border-[#EB712B] outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs uppercase font-bold text-gray-500 tracking-widest">AMOUNT</label>
                  <input placeholder="$ 00.0" className="w-full h-14 bg-[#050505] border border-white/[0.05] rounded-2xl px-4 text-md focus:border-[#EB712B] outline-none" />
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs uppercase font-bold text-gray-500 tracking-widest">DESCRIPTION</label>
                <textarea placeholder="Details..." className="w-full h-[148px] bg-[#050505] border border-white/[0.05] rounded-2xl p-4 text-md focus:border-[#EB712B] outline-none resize-none" />
              </div>
            </div>

            {/* Full Width Bottom Row */}
            <div className="col-span-2 space-y-3">
              <label className="text-xs uppercase font-bold text-gray-500 tracking-widest">DISCOUNT CODE</label>
              <input 
                placeholder="5457-5A" 
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className={`w-full h-14 bg-[#050505] border rounded-2xl px-4 text-md outline-none focus:border-[#EB712B] ${errors.code ? 'border-[#EB712B]' : 'border-white/[0.05]'}`} 
              />
              {errors.code && <p className="text-[#EB712B] text-xs font-semibold">{errors.code}</p>}
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full h-16 mt-8 rounded-2xl bg-[#EB712B]  text-white font-black text-sm uppercase  transition-all "
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddDiscount;