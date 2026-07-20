import { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Edit2, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import {
  useGetClubTermsQuery,
  useAddClubTermsMutation,
  useUpdateClubTermsMutation,
} from '@/features/club/api/clubApiSlice';
import { toast } from 'sonner';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { clubId } = useActiveClub();
  const permissions = useClubPermissions(clubId || undefined);

  const effectiveClubId = clubId ? Number(clubId) : 0;
  const { data: termsData, isLoading } = useGetClubTermsQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  const [addTerms, { isLoading: isAdding }] = useAddClubTermsMutation();
  const [updateTerms, { isLoading: isUpdating }] = useUpdateClubTermsMutation();
  const isSaving = isAdding || isUpdating;

  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');

  const dynamicPrivacy = (
    termsData?.privacyPolicy ||
    (typeof termsData === 'string' ? termsData : '')
  );

  useEffect(() => {
    if (dynamicPrivacy) {
      setEditableContent(dynamicPrivacy);
    }
  }, [dynamicPrivacy]);

  const handleSave = async () => {
    if (!effectiveClubId) return;
    try {
      if (termsData && (termsData.id || dynamicPrivacy)) {
        await updateTerms({ clubId: effectiveClubId, privacyPolicy: editableContent }).unwrap();
      } else {
        await addTerms({ clubId: effectiveClubId, privacyPolicy: editableContent }).unwrap();
      }
      toast.success('Privacy policy updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save privacy policy.');
    }
  };

  return (
    <div className="w-full text-text-main font-sans min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors text-sm font-bold border-0 bg-transparent cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {permissions.isOwner && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#EB712B]/10 hover:bg-[#EB712B]/20 text-[#EB712B] rounded-xl text-xs font-bold transition-colors cursor-pointer border border-[#EB712B]/20"
            >
              <Edit2 size={14} /> Edit Privacy Policy
            </button>
          )}

          {permissions.isOwner && isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-surface hover:bg-hover border border-border text-text-muted text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border-0 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Privacy Policy
              </button>
            </div>
          )}
        </div>

        <div className="mb-12">
          <div className="w-16 h-16 rounded-2xl bg-[#EB712B]/10 flex items-center justify-center mb-6 border border-[#EB712B]/20">
            <ShieldCheck size={32} className="text-[#EB712B]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-text-muted text-sm max-w-2xl">
            {termsData?.updatedAt ? `Last updated: ${new Date(termsData.updatedAt).toLocaleDateString()}` : 'This Privacy Policy describes how Ride With Pals collects, uses, and discloses your information.'}
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={32} className="animate-spin text-[#EB712B]" />
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">
              Club Privacy Policy Content
            </label>
            <textarea
              rows={16}
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl p-4 text-sm text-text-main outline-none focus:border-[#EB712B] custom-scrollbar font-sans"
              placeholder="Enter your club privacy policy here..."
            />
          </div>
        ) : dynamicPrivacy ? (
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-10 space-y-6 text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
            {dynamicPrivacy}
          </div>
        ) : (
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold text-text-main mb-4">1. Information We Collect</h2>
              <div className="text-text-muted text-sm space-y-4 leading-relaxed">
                <p>We collect information you provide directly to us when you create an account, modify your profile, or interact with the platform. This includes:</p>
                <ul className="list-disc pl-5 space-y-2 text-text-muted">
                  <li><strong className="text-text-main">Account Data:</strong> Name, email address, phone number, and profile picture.</li>
                  <li><strong className="text-text-main">Ride Data:</strong> GPS coordinates, speed, distance, and routes taken during tracked activities.</li>
                  <li><strong className="text-text-main">Device Information:</strong> Hardware model, operating system, and unique device identifiers.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-main mb-4">2. How We Use Your Information</h2>
              <div className="text-text-muted text-sm space-y-4 leading-relaxed">
                <p>We use the collected data to provide, maintain, and improve our services, including:</p>
                <ul className="list-disc pl-5 space-y-2 text-text-muted">
                  <li>Facilitating club memberships and event coordination.</li>
                  <li>Processing transactions for marketplace and premium features.</li>
                  <li>Analyzing performance metrics to provide personalized insights.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-main mb-4">3. Data Sharing and Disclosure</h2>
              <div className="text-text-muted text-sm space-y-4 leading-relaxed">
                <p>Your privacy is critical to us. We do not sell your personal data. Information is only shared under the following conditions:</p>
                <ul className="list-disc pl-5 space-y-2 text-text-muted">
                  <li><strong className="text-text-main">Club Visibility:</strong> Ride data and profile information are shared with your active club members based on your visibility settings.</li>
                  <li><strong className="text-text-main">Service Providers:</strong> We share data with trusted third parties who assist in operating our platform (e.g., payment processors, hosting services).</li>
                  <li><strong className="text-text-main">Legal Requirements:</strong> If required by law or to protect the safety of our users.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-main mb-4">4. Your Privacy Rights</h2>
              <div className="text-text-muted text-sm space-y-4 leading-relaxed">
                <p>Depending on your jurisdiction, you have the right to request access, correction, or deletion of your personal data. You can manage most of your privacy settings directly from the <strong className="text-text-main">Profile & Account</strong> section.</p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
