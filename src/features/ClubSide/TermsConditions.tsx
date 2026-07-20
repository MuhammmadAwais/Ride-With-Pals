import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Edit2, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import {
  useGetClubTermsQuery,
  useAddClubTermsMutation,
  useUpdateClubTermsMutation,
} from '@/features/club/api/clubApiSlice';
import { toast } from 'sonner';

const TermsConditions = () => {
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

  const dynamicTerms = (
    termsData?.termsAndConditions ||
    termsData?.content ||
    (typeof termsData === 'string' ? termsData : '')
  );

  useEffect(() => {
    if (dynamicTerms) {
      setEditableContent(dynamicTerms);
    }
  }, [dynamicTerms]);

  const handleSave = async () => {
    if (!effectiveClubId) return;
    try {
      if (termsData && (termsData.id || dynamicTerms)) {
        await updateTerms({ clubId: effectiveClubId, termsAndConditions: editableContent }).unwrap();
      } else {
        await addTerms({ clubId: effectiveClubId, termsAndConditions: editableContent }).unwrap();
      }
      toast.success('Terms and conditions updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save terms and conditions.');
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
              <Edit2 size={14} /> Edit Terms
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
                Save Terms
              </button>
            </div>
          )}
        </div>

        <div className="mb-12">
          <div className="w-16 h-16 rounded-2xl bg-[#EB712B]/10 flex items-center justify-center mb-6 border border-[#EB712B]/20">
            <FileText size={32} className="text-[#EB712B]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tight mb-4">Terms & Conditions</h1>
          <p className="text-text-muted text-sm max-w-2xl">
            {termsData?.updatedAt ? `Last updated: ${new Date(termsData.updatedAt).toLocaleDateString()}` : 'Please read these terms and conditions carefully before using our service.'}
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={32} className="animate-spin text-[#EB712B]" />
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">
              Club Terms & Conditions Content
            </label>
            <textarea
              rows={16}
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl p-4 text-sm text-text-main outline-none focus:border-[#EB712B] custom-scrollbar font-sans"
              placeholder="Enter your club terms and conditions here..."
            />
          </div>
        ) : dynamicTerms ? (
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-10 space-y-6 text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
            {dynamicTerms}
          </div>
        ) : (
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold text-text-main mb-4">1. Acceptance of Terms</h2>
              <div className="text-text-muted text-sm space-y-4 leading-relaxed">
                <p>By accessing or using Ride With Pals, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-main mb-4">2. Club Memberships and Responsibilities</h2>
              <div className="text-text-muted text-sm space-y-4 leading-relaxed">
                <p>As a club member or owner, you agree to adhere to the community guidelines and safety protocols.</p>
                <ul className="list-disc pl-5 space-y-2 text-text-muted">
                  <li><strong className="text-text-main">Safety First:</strong> You are responsible for ensuring your equipment is safe and compliant with local regulations.</li>
                  <li><strong className="text-text-main">Respect:</strong> Harassment or inappropriate behavior towards other members will result in immediate suspension.</li>
                  <li><strong className="text-text-main">Accuracy:</strong> You agree to provide accurate information regarding your skill level and ride metrics.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-main mb-4">3. Subscriptions and Payments</h2>
              <div className="text-text-muted text-sm space-y-4 leading-relaxed">
                <p>Some features require a paid subscription. Payments are processed securely via our trusted payment providers.</p>
                <ul className="list-disc pl-5 space-y-2 text-text-muted">
                  <li><strong className="text-text-main">Billing:</strong> Subscriptions are billed in advance on a recurring basis.</li>
                  <li><strong className="text-text-main">Cancellations:</strong> You may cancel your subscription at any time. Refunds are not provided for partial billing periods.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-main mb-4">4. Limitation of Liability</h2>
              <div className="text-text-muted text-sm space-y-4 leading-relaxed">
                <p>Ride With Pals is not liable for any injuries, damages, or losses incurred during activities organized through the platform. Cycling involves inherent risks, and participants assume all responsibility.</p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsConditions;
