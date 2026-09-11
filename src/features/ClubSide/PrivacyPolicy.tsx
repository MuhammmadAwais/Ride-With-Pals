import { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Edit2, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
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
      toast.success(t`Privacy policy updated successfully!`);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to save privacy policy.`);
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
            <ArrowLeft size={16} /> <Trans>Back</Trans>
          </button>

          {permissions.isOwner && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#EB712B]/10 hover:bg-[#EB712B]/20 text-[#EB712B] rounded-xl text-xs font-bold transition-colors cursor-pointer border border-[#EB712B]/20"
            >
              <Edit2 size={14} /> <Trans>Edit Privacy Policy</Trans>
            </button>
          )}

          {permissions.isOwner && isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-surface hover:bg-hover border border-border text-text-muted text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Trans>Cancel</Trans>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border-0 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <Trans>Save Privacy Policy</Trans>
              </button>
            </div>
          )}
        </div>

        <div className="mb-12">
          <div className="w-16 h-16 rounded-2xl bg-[#EB712B]/10 flex items-center justify-center mb-6 border border-[#EB712B]/20">
            <ShieldCheck size={32} className="text-[#EB712B]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tight mb-4"><Trans>Privacy Policy</Trans></h1>
          <p className="text-text-muted text-sm max-w-2xl">
            {termsData?.updatedAt ? t`Last updated: ${new Date(termsData.updatedAt).toLocaleDateString()}` : <Trans>This Privacy Policy describes how Ride With Pals collects, uses, and discloses your information.</Trans>}
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={32} className="animate-spin text-[#EB712B]" />
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">
              <Trans>Club Privacy Policy Content</Trans>
            </label>
            <textarea
              rows={16}
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl p-4 text-sm text-text-main outline-none focus:border-[#EB712B] custom-scrollbar font-sans"
              placeholder={t`Enter your club privacy policy here...`}
            />
          </div>
        ) : dynamicPrivacy ? (
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-10 space-y-6 text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
            {dynamicPrivacy}
          </div>
        ) : (
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold text-text-main mb-4"><Trans>1. Information We Collect</Trans></h2>
              <div className="text-text-muted text-sm space-y-4 leading-relaxed">
                <p><Trans>We collect information you provide directly to us when you create an account, modify your profile, or interact with the platform. This includes:</Trans></p>
                <ul className="list-disc pl-5 space-y-2 text-text-muted">
                  <li><strong className="text-text-main"><Trans>Account Data:</Trans></strong> <Trans>Name, email address, phone number, and profile picture.</Trans></li>
                  <li><strong className="text-text-main"><Trans>Ride Data:</Trans></strong> <Trans>GPS coordinates, speed, distance, and routes taken during tracked activities.</Trans></li>
                  <li><strong className="text-text-main"><Trans>Device Information:</Trans></strong> <Trans>Hardware model, operating system, and unique device identifiers.</Trans></li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-main mb-4"><Trans>2. How We Use Your Information</Trans></h2>
              <div className="text-text-muted text-sm space-y-4 leading-relaxed">
                <p><Trans>We use the collected data to provide, maintain, and improve our services, including:</Trans></p>
                <ul className="list-disc pl-5 space-y-2 text-text-muted">
                  <li><Trans>Facilitating club memberships and event coordination.</Trans></li>
                  <li><Trans>Processing transactions for marketplace and premium features.</Trans></li>
                  <li><Trans>Analyzing performance metrics to provide personalized insights.</Trans></li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-main mb-4"><Trans>3. Data Sharing and Disclosure</Trans></h2>
              <div className="text-text-muted text-sm space-y-4 leading-relaxed">
                <p><Trans>Your privacy is critical to us. We do not sell your personal data. Information is only shared under the following conditions:</Trans></p>
                <ul className="list-disc pl-5 space-y-2 text-text-muted">
                  <li><strong className="text-text-main"><Trans>Club Visibility:</Trans></strong> <Trans>Ride data and profile information are shared with your active club members based on your visibility settings.</Trans></li>
                  <li><strong className="text-text-main"><Trans>Service Providers:</Trans></strong> <Trans>We share data with trusted third parties who assist in operating our platform (e.g., payment processors, hosting services).</Trans></li>
                  <li><strong className="text-text-main"><Trans>Legal Requirements:</Trans></strong> <Trans>If required by law or to protect the safety of our users.</Trans></li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-main mb-4"><Trans>4. Your Privacy Rights</Trans></h2>
              <div className="text-text-muted text-sm space-y-4 leading-relaxed">
                <p><Trans>Depending on your jurisdiction, you have the right to request access, correction, or deletion of your personal data. You can manage most of your privacy settings directly from the <strong className="text-text-main">Profile & Account</strong> section.</Trans></p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
