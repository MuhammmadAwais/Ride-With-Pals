import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, CalendarDays, LockKeyhole, User, ShieldCheck } from 'lucide-react';

const SubPaymentDet = () => {
  const navigate = useNavigate();
  const [focused, setFocused] = useState<string | null>(null);
  const [formData, setFormData] = useState({ number: '', expiry: '', cvv: '', holder: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'number') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const formatted = v.match(/.{1,4}/g)?.join(' ') || '';
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    if (name === 'expiry') {
      let v = value.replace(/[^0-9]/g, '');
      if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
      setFormData({ ...formData, [name]: v });
      return;
    }
    if (name === 'cvv') {
      setFormData({ ...formData, [name]: value.replace(/[^0-9]/g, '') });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  // Adjusted input height to 14 (medium-large) instead of 20
  const inputClasses = (name: string) => `
    w-full h-14 bg-[#0a0a0a] border border-white/[0.08] rounded-2xl pl-12 pr-4 outline-none text-md transition-all duration-300
    ${focused === name ? 'border-[#EB712B] shadow-[0_0_15px_rgba(235,113,43,0.1)]' : 'hover:border-white/[0.2]'}
  `;

  return (
    <div className="min-h-screen  text-white p-6 md:p-10 flex flex-col items-center">
      {/* Container max-w-2xl keeps it contained but comfortable */}
      <div className="w-full max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-[0.2em]">
          <ArrowLeft size={16} /> Return to plan
        </button>

        <form onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }} className="bg-[#0c0c0c] border border-white/[0.05] rounded-[32px] p-8 md:p-10 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">Secure Payment</h2>
            <ShieldCheck className="text-[#EB712B]" size={28} />
          </div>

          <div className="space-y-5">
            <div className="relative">
              <CreditCard className="absolute left-4 top-4 text-gray-600" size={20} />
              <input name="number" placeholder="0000 0000 0000 0000" className={inputClasses('number')} value={formData.number} onChange={handleChange} onFocus={() => setFocused('number')} onBlur={() => setFocused(null)} maxLength={19} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <CalendarDays className="absolute left-4 top-4 text-gray-600" size={20} />
                <input name="expiry" placeholder="MM/YY" className={inputClasses('expiry')} value={formData.expiry} onChange={handleChange} onFocus={() => setFocused('expiry')} onBlur={() => setFocused(null)} maxLength={5} required />
              </div>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-4 text-gray-600" size={20} />
                <input name="cvv" placeholder="CVV" type="text" className={inputClasses('cvv')} value={formData.cvv} onChange={handleChange} onFocus={() => setFocused('cvv')} onBlur={() => setFocused(null)} maxLength={4} required />
              </div>
            </div>

            <div className="relative">
              <User className="absolute left-4 top-4 text-gray-600" size={20} />
              <input name="holder" placeholder="Cardholder Name" className={inputClasses('holder')} value={formData.holder} onChange={handleChange} onFocus={() => setFocused('holder')} onBlur={() => setFocused(null)} required />
            </div>
          </div>

          <button type="submit" className="w-full h-14 mt-8 rounded-2xl bg-[#EB712B]  text-white font-black text-sm uppercase tracking-[0.2em] transition-all ">
            COMPLETE PAYMENT
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubPaymentDet;