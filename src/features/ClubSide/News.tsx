/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Bookmark, 
  Edit2, 
  Trash2, 
  Loader2, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  X,
  Send,
  Newspaper,
  ShieldAlert,
  UploadCloud,
  Bold,
  Italic,
  List,
  Quote,
  Sparkles,
  ArrowRight,
  Pin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { 
  useGetAllNewsQuery, 
  useGetAllNewsCommentsQuery, 
  useAddCommentMutation, 
  useDelCommentMutation, 
  useDeleteNewsMutation,
  useAddNewsMutation,
  useUpdateNewsMutation
} from '@/features/club/api/newsApiSlice';
import { useUploadFileMutation } from '@/features/auth/api/authApiSlice';
import { useGetClubInfoByIdQuery } from '@/features/club/api/clubApiSlice';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import { useAppSelector } from '@/hooks/useAppSelector';
import { resolveImageUrl } from '@/features/public-club/services/clubGeocoding';

/**
 * ArticleComments sub-component.
 * Delete button is gated: only the comment author OR an admin/owner can delete.
 */
const ArticleComments = ({ newsId }: { newsId: number }) => {
  const [newComment, setNewComment] = useState('');
  const { data: commentsData, isLoading } = useGetAllNewsCommentsQuery({ newsId });
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [deleteComment] = useDelCommentMutation();

  // Auth context for role-gated delete
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const { clubId: activeClubId } = useActiveClub();
  const permissions = useClubPermissions(activeClubId || undefined);

  const comments = commentsData?.rows || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addComment({ newsId, comment: newComment.trim() }).unwrap();
      setNewComment('');
      toast.success(t`Comment posted successfully!`);
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to post comment.`);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteComment({ newsId, newsCommentId: commentId }).unwrap();
      toast.success(t`Comment deleted.`);
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to delete comment.`);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border mt-4">
      <h4 className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-2">
        <MessageSquare size={13} />
        <span><Trans>Discussion ({comments.length})</Trans></span>
      </h4>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={16} className="animate-spin text-[#EB712B]" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-text-muted italic"><Trans>No comments yet. Start the conversation!</Trans></p>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {comments.map((c: any) => {
            const isAuthor = currentUserId && String(c.userId) === String(currentUserId);
            const canDelete = isAuthor || permissions.canPublishNews;

            return (
              <div 
                key={c.id} 
                className="bg-hover/50 rounded-xl p-3 flex justify-between items-start gap-2 border border-border/50"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-main truncate">
                      {c.user?.fullName || c.user?.name || t`Club Member`}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed break-words">{c.comment}</p>
                </div>

                {canDelete && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-text-muted hover:text-red-400 p-1 rounded transition-colors text-[10px] shrink-0 cursor-pointer"
                    title={t`Delete comment`}
                  >
                    <Trans>Delete</Trans>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
        <input
          type="text"
          placeholder={t`Write a comment...`}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 bg-surface border border-border px-4 py-2.5 rounded-xl text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-[#EB712B]/50 transition-colors"
        />
        <button
          type="submit"
          disabled={isAdding || !newComment.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#EB712B] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#ff8036] disabled:opacity-40 transition-all cursor-pointer"
        >
          {isAdding ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          <span><Trans>Post</Trans></span>
        </button>
      </form>
    </div>
  );
};

interface NewsArticleProps {
  item: any;
  canManage: boolean;
  onDelete: (id: number) => void;
  onEdit?: (item: any) => void;
  isDeletingId: number | null;
}

const NewsArticle: React.FC<NewsArticleProps> = ({ item, canManage, onDelete, onEdit, isDeletingId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const isDeleting = isDeletingId === Number(item.id);

  const displayImage = item.image || '/Images/CyclingPicture.jpg';

  return (
    <article className="group relative bg-surface border border-border rounded-2xl p-5 sm:p-6 overflow-hidden transition-all duration-300 hover:border-[#EB712B]/40">
      <div className="flex flex-col md:flex-row gap-5 lg:gap-6 items-start">
        {/* Cover visual thumbnail */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full md:w-64 lg:w-72 shrink-0 aspect-[16/10] overflow-hidden rounded-xl bg-hover border border-border relative cursor-pointer group/thumb"
        >
          <img 
            src={displayImage} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-104"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/Images/CyclingPicture.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover/thumb:opacity-40 transition-opacity" />
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono tracking-widest text-white/90 uppercase font-semibold">
            <Trans>Club Dispatch</Trans>
          </span>
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 space-y-3 w-full">
          {/* Metadata Topline & Controls */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 text-[11px] text-text-muted font-medium flex-wrap">
              {item.isPinned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EB712B]/15 text-[#EB712B] border border-[#EB712B]/30 shadow-sm">
                  <Pin size={11} className="rotate-45" />
                  <Trans>Pinned Bulletin</Trans>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#EB712B]" />
                {item.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#EB712B]" />
                {item.readingTime}
              </span>
            </div>

            {/* Admin Controls */}
            {canManage && (
              <div className="flex items-center gap-1">
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-[#EB712B] hover:bg-hover transition-colors cursor-pointer"
                    title={t`Edit article`}
                  >
                    <Edit2 size={13} />
                  </button>
                )}
                <button
                  onClick={() => onDelete(Number(item.id))}
                  disabled={isDeleting}
                  className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                  title={t`Delete article`}
                >
                  {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-lg sm:text-xl font-extrabold text-text-main group-hover:text-[#EB712B] transition-colors leading-snug cursor-pointer line-clamp-2"
          >
            {item.title}
          </h3>

          {/* Body / Excerpt */}
          <div className="space-y-3">
            {!isExpanded ? (
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-2">
                {item.previewText}
              </p>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="text-xs sm:text-sm text-text-main/90 leading-relaxed whitespace-pre-line">
                  {item.fullContent}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
            {/* Author */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-full bg-hover flex items-center justify-center text-[8px] font-black text-[#EB712B] border border-border shrink-0">
                {item.authorInitials}
              </div>
              <span className="text-xs font-medium text-text-muted truncate max-w-[140px]">{item.author}</span>
            </div>

            {/* Actions: Comments & Read More */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isExpanded) setIsExpanded(true);
                  setShowComments(!showComments);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-[#EB712B] transition-colors cursor-pointer"
              >
                <MessageSquare size={13} />
                <span>{item.totalCommentsCount || 0}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#EB712B] hover:text-[#ff8036] transition-colors cursor-pointer"
              >
                <span>{isExpanded ? <Trans>Collapse</Trans> : <Trans>Read Article</Trans>}</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* Expandable comments */}
          {isExpanded && showComments && (
            <div className="animate-in fade-in duration-300">
              <ArticleComments newsId={Number(item.id)} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

/**
 * In-Context Article Publishing & Editing Modal
 */
interface PublishArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: number | string;
  clubName?: string;
  editingArticle?: any | null;
  onPermissionDenied?: () => void;
}

const PublishArticleModal: React.FC<PublishArticleModalProps> = ({
  isOpen,
  onClose,
  clubId,
  clubName,
  editingArticle,
  onPermissionDenied,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addNews, { isLoading: isAdding }] = useAddNewsMutation();
  const [updateNews, { isLoading: isUpdating }] = useUpdateNewsMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const isBusy = isSubmitting || isAdding || isUpdating || isUploading;

  useEffect(() => {
    if (isOpen) {
      if (editingArticle) {
        setTitle(editingArticle.title || '');
        setDescription(editingArticle.fullContent || editingArticle.previewText || editingArticle.description || '');
        setPreviewUrl(editingArticle.image || null);
        setIsPinned(Boolean(editingArticle.isPinned));
        setSelectedFile(null);
      } else {
        setTitle('');
        setDescription('');
        setIsPinned(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    }
  }, [isOpen, editingArticle]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t`Image size must be under 10MB.`);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('article-description-input') as HTMLTextAreaElement;
    if (!textarea) {
      setDescription((prev) => prev + prefix + suffix);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end) || 'text';
    const replacement = prefix + selectedText + suffix;
    const nextDescription = description.substring(0, start) + replacement + description.substring(end);
    setDescription(nextDescription);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t`Please enter an article title.`);
      return;
    }
    if (!description.trim()) {
      toast.error(t`Please enter article content.`);
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = previewUrl?.startsWith('http') && !selectedFile ? previewUrl : '';

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await uploadFile(formData).unwrap();
        imageUrl = uploadRes.fileName || '';
      }

      if (editingArticle?.id) {
        await updateNews({
          id: Number(editingArticle.id),
          title: title.trim(),
          description: description.trim(),
          clubId: Number(clubId),
          image: imageUrl || undefined,
          isPinned,
        }).unwrap();
        toast.success(t`Article updated successfully!`);
      } else {
        await addNews({
          title: title.trim(),
          description: description.trim(),
          clubId: Number(clubId),
          image: imageUrl || undefined,
          isPinned,
        }).unwrap();
        toast.success(t`Article published to club feed!`);
      }
      onClose();
    } catch (err: any) {
      console.error('News publication error:', err);
      const status = err?.status || err?.originalStatus;
      const message = err?.data?.message || err?.message || '';
      const isForbidden =
        status === 403 ||
        status === 401 ||
        message.toLowerCase().includes('permission') ||
        message.toLowerCase().includes('unauthorized') ||
        message.toLowerCase().includes('forbidden') ||
        message.toLowerCase().includes('not allowed');

      if (isForbidden) {
        onClose();
        onPermissionDenied?.();
      } else {
        toast.error(message || t`Failed to publish article. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-surface border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EB712B]/10 border border-[#EB712B]/20 flex items-center justify-center text-[#EB712B] shrink-0">
              <Newspaper size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-text-main uppercase tracking-tight">
                {editingArticle ? <Trans>Edit Club Dispatch</Trans> : <Trans>New Club Dispatch</Trans>}
              </h3>
              <p className="text-xs text-text-muted">
                {clubName ? t`Publishing to ${clubName}` : <Trans>Share an announcement or recap with the club</Trans>}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="p-2 text-text-muted hover:text-text-main rounded-xl hover:bg-hover transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* Cover Image Upload Area */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono tracking-wider text-text-muted uppercase font-bold block">
              <Trans>Article Cover Image</Trans>
            </label>

            {previewUrl ? (
              <div className="relative aspect-[16/8] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-border group bg-black/40">
                <img 
                  src={previewUrl} 
                  alt="Cover preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer border border-white/20"
                  >
                    <Trans>Change Image</Trans>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-lg bg-red-600/80 backdrop-blur-md text-white hover:bg-red-600 transition-colors cursor-pointer"
                    title={t`Remove image`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-[#EB712B]/60 p-6 sm:p-8 rounded-2xl text-center cursor-pointer transition-colors bg-hover/30 hover:bg-hover/60 group"
              >
                <UploadCloud size={28} className="text-[#EB712B] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-bold text-text-main">
                  <Trans>Click to select or upload a cover image</Trans>
                </p>
                <p className="text-[11px] text-text-muted mt-1">
                  <Trans>JPG, PNG, or WebP up to 10MB (recommended aspect 16:9)</Trans>
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Article Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono tracking-wider text-text-muted uppercase font-bold block">
              <Trans>Article Title</Trans> <span className="text-[#EB712B]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={t`e.g., Weekend Gravel Ride Briefing & Pace Groups`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface border border-border px-4 py-3 rounded-xl text-sm font-bold text-text-main placeholder:text-text-muted/60 focus:outline-none focus:border-[#EB712B]/60 transition-colors"
            />
          </div>

          {/* Article Content with Formatting Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono tracking-wider text-text-muted uppercase font-bold block">
                <Trans>Content & Briefing</Trans> <span className="text-[#EB712B]">*</span>
              </label>

              {/* Formatting Helper Buttons */}
              <div className="flex items-center gap-1 text-text-muted">
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**')}
                  className="p-1 rounded hover:bg-hover hover:text-text-main transition-colors text-xs font-bold"
                  title={t`Bold (**text**)`}
                >
                  <Bold size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*')}
                  className="p-1 rounded hover:bg-hover hover:text-text-main transition-colors text-xs font-bold"
                  title={t`Italic (*text*)`}
                >
                  <Italic size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n• ')}
                  className="p-1 rounded hover:bg-hover hover:text-text-main transition-colors text-xs font-bold"
                  title={t`Bullet list`}
                >
                  <List size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n> ')}
                  className="p-1 rounded hover:bg-hover hover:text-text-main transition-colors text-xs font-bold"
                  title={t`Quote`}
                >
                  <Quote size={13} />
                </button>
              </div>
            </div>

            <textarea
              id="article-description-input"
              required
              rows={7}
              placeholder={t`Share full details with club members: route recaps, elevation profiles, meetup coordinates, pacing guidelines, or general announcements...`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface border border-border p-4 rounded-xl text-xs sm:text-sm text-text-main placeholder:text-text-muted/60 focus:outline-none focus:border-[#EB712B]/60 transition-colors leading-relaxed resize-y custom-scrollbar"
            />

            {/* Pin Announcement Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-hover/50 border border-border mt-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg border transition-colors ${isPinned ? 'bg-[#EB712B]/15 text-[#EB712B] border-[#EB712B]/30' : 'bg-surface text-text-muted border-border'}`}>
                  <Pin size={15} className={isPinned ? 'rotate-45' : ''} />
                </div>
                <div>
                  <span className="text-xs font-bold text-text-main block">
                    <Trans>Pin Announcement</Trans>
                  </span>
                  <span className="text-[10px] text-text-muted block">
                    <Trans>Featured at the top of the club feed</Trans>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPinned ? 'bg-[#EB712B]' : 'bg-surface border-border'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isPinned ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-text-muted hover:text-text-main hover:bg-hover transition-colors cursor-pointer"
          >
            <Trans>Cancel</Trans>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isBusy || !title.trim() || !description.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#EB712B] hover:bg-[#ff8036] disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-lg shadow-[#EB712B]/20 cursor-pointer"
          >
            {isBusy ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>{editingArticle ? <Trans>Saving...</Trans> : <Trans>Publishing...</Trans>}</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>{editingArticle ? <Trans>Update Dispatch</Trans> : <Trans>Publish Dispatch</Trans>}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Friendly Permission Denied Modal with CTA
 */
interface PublishRestrictedModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubName?: string;
  onContactLeadership: () => void;
}

const PublishRestrictedModal: React.FC<PublishRestrictedModalProps> = ({
  isOpen,
  onClose,
  clubName,
  onContactLeadership,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main rounded-xl hover:bg-hover transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#EB712B]/10 border border-[#EB712B]/20 flex items-center justify-center mx-auto text-[#EB712B]">
          <ShieldAlert size={32} />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-[#EB712B] uppercase font-bold">
            <Trans>Author Permissions Required</Trans>
          </span>
          <h3 className="text-xl font-black text-text-main uppercase tracking-tight">
            <Trans>Publishing Restricted</Trans>
          </h3>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-sm mx-auto">
            <Trans>Publishing official club dispatches to <span className="text-text-main font-semibold">{clubName || "this club"}</span> is reserved for club organizers, team managers, and verified contributors.</Trans>
          </p>
          <p className="text-xs text-text-muted/80 leading-relaxed pt-1">
            <Trans>Have a ride briefing, event recap, or notice you'd like to share? Contact club leadership to request contributor permissions.</Trans>
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={onContactLeadership}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#EB712B] hover:bg-[#ff8036] text-white font-black text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-lg shadow-[#EB712B]/20 cursor-pointer"
          >
            <MessageSquare size={15} />
            <span><Trans>Message Club Leadership</Trans></span>
            <ArrowRight size={13} />
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-border hover:bg-hover text-text-muted hover:text-text-main font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Trans>Understood</Trans>
          </button>
        </div>
      </div>
    </div>
  );
};

const NewsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2].map((i) => (
      <div key={i} className="bg-surface/50 border border-border rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row gap-5">
        <div className="w-full md:w-64 lg:w-72 aspect-[16/10] bg-hover rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="w-32 h-3 bg-border rounded" />
          <div className="w-3/4 h-5 bg-border rounded" />
          <div className="w-full h-12 bg-border/40 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

interface NewsFeedProps {
  clubId?: string | number;
  club?: any;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ clubId, club }) => {
  const navigate = useNavigate();
  const { clubId: activeClubIdRedux } = useActiveClub();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isRestrictedModalOpen, setIsRestrictedModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);

  const activeClubId = clubId || activeClubIdRedux;

  // Resolve club information for leadership contact
  const { data: fetchedClubData } = useGetClubInfoByIdQuery(
    { clubId: Number(activeClubId) },
    { skip: Boolean(club) || !activeClubId }
  );

  const resolvedClub = club || (fetchedClubData as any)?.response || (fetchedClubData as any)?.data || fetchedClubData;
  const clubName = resolvedClub?.clubName || resolvedClub?.name || 'Club';

  const organizerId = resolvedClub?.userId || resolvedClub?.ownerId || resolvedClub?.owner_id;
  const organizerName = resolvedClub?.user?.fullName || resolvedClub?.user?.firstName || (clubName ? `${clubName} Leadership` : 'Club Organizer');
  const organizerAvatar = resolvedClub?.user?.profileImage || resolvedClub?.logo || '/Images/CycleImage.png';

  const permissions = useClubPermissions(activeClubId || undefined);
  const canManage = permissions.canPublishNews;

  const { data: newsData, isLoading } = useGetAllNewsQuery(
    { clubId: Number(activeClubId) },
    { skip: !activeClubId }
  );

  const [deleteNews] = useDeleteNewsMutation();

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteNews({ id }).unwrap();
      toast.success(t`Article deleted successfully!`);
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to delete article.`);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublishClick = () => {
    if (canManage) {
      setEditingArticle(null);
      setIsPublishModalOpen(true);
    } else {
      setIsRestrictedModalOpen(true);
    }
  };

  const handleEditArticle = (item: any) => {
    if (canManage) {
      setEditingArticle(item);
      setIsPublishModalOpen(true);
    } else {
      setIsRestrictedModalOpen(true);
    }
  };

  const handleMessageLeadership = () => {
    setIsRestrictedModalOpen(false);
    if (organizerId) {
      navigate('/view/userside/support', { 
        state: { 
          targetUserId: organizerId,
          targetUserName: organizerName,
          targetUserAvatar: organizerAvatar
        } 
      });
    } else {
      toast.error(t`Unable to find club leadership contact details.`);
    }
  };

  const newsItems = useMemo(() => {
    const items = newsData?.rows || [];
    // Sort pinned items to the top, then by creation date descending
    const sorted = [...items].sort((a: any, b: any) => {
      const aPinned = Boolean(a.isPinned);
      const bPinned = Boolean(b.isPinned);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return sorted.map((item: any, index: number) => {
      const rawImg = item.image || item.imageUrl || null;
      const image = resolveImageUrl(rawImg);
      const readingMinutes = Math.max(1, Math.ceil((item.description || item.content || '').split(/\s+/).filter(Boolean).length / 150));
      return {
        id: item.id?.toString() || index.toString(),
        title: item.title || t`Untitled Article`,
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : t`Recent`,
        previewText: item.description || (item.content ? item.content.slice(0, 180) + '...' : t`No description provided.`),
        fullContent: item.description || item.content || t`No content provided.`,
        image: image,
        isPinned: Boolean(item.isPinned),
        pinnedAt: item.pinnedAt,
        readingTime: t`${readingMinutes} min read`,
        author: item.user?.fullName || item.author || t`Club Leadership`,
        authorInitials: (item.user?.fullName || item.author || 'CL').slice(0, 2).toUpperCase(),
        totalCommentsCount: item.totalCommentsCount || 0
      };
    });
  }, [newsData]);

  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) return newsItems;
    const q = searchQuery.toLowerCase().trim();
    return newsItems.filter((n) => 
      n.title.toLowerCase().includes(q) || 
      n.fullContent.toLowerCase().includes(q)
    );
  }, [newsItems, searchQuery]);

  if (!activeClubId) {
    return (
      <div className="p-8 font-sans">
        <div className="bg-surface border border-border rounded-3xl p-12 text-center space-y-4">
          <Bookmark size={36} className="text-[#EB712B] mx-auto mb-2" />
          <h2 className="text-xl font-bold text-text-main"><Trans>No Club Selected</Trans></h2>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            <Trans>Please select or join a club to view its community news feed.</Trans>
          </p>
        </div>
      </div>
    );
  }

  // Render content with context-aware wrapper
  const isEmbeddedInTab = Boolean(clubId);

  return (
    <div className={isEmbeddedInTab ? "w-full space-y-6 font-sans animate-in fade-in duration-300" : "min-h-screen text-text-main bg-main-bg p-4 sm:p-6 md:p-12 font-sans"}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main uppercase">
              <Trans>Club Dispatches & News</Trans>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-surface border border-border text-[10px] font-mono font-bold text-text-muted">
              {newsItems.length} {newsItems.length === 1 ? t`Article` : t`Articles`}
            </span>
          </div>
          <p className="text-xs text-text-muted">
            <Trans>Official announcements, ride recaps, and community notices from club leadership.</Trans>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {newsItems.length > 2 && (
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={13} />
              <input
                type="text"
                placeholder={t`Filter articles...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border pl-8 pr-7 py-2 rounded-xl text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-[#EB712B]/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Action Button: Opens In-Context Composer (if permitted) or Friendly Help Dialog (if restricted) */}
          <button
            type="button"
            onClick={handlePublishClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer shrink-0 shadow-md shadow-[#EB712B]/20"
          >
            <Plus size={15} />
            <span><Trans>Publish Article</Trans></span>
          </button>
        </div>
      </div>

      {/* Main Articles List */}
      <div className="space-y-4">
        {isLoading ? (
          <NewsSkeleton />
        ) : filteredNews.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-hover border border-border flex items-center justify-center mx-auto text-[#EB712B]">
              <Newspaper size={22} />
            </div>
            <h3 className="text-base font-bold text-text-main">
              {searchQuery ? <Trans>No matching dispatches found</Trans> : <Trans>No Club Dispatches Yet</Trans>}
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              {searchQuery 
                ? t`No articles matched "${searchQuery}". Try a different keyword.` 
                : <Trans>Official club updates, ride briefings, and announcements will appear here.</Trans>}
            </p>
            {!searchQuery && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePublishClick}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-hover hover:bg-[#EB712B] hover:text-white border border-border rounded-xl text-xs font-bold uppercase tracking-wider text-text-main transition-colors cursor-pointer"
                >
                  <Plus size={14} /> <Trans>Create First Post</Trans>
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredNews.map((item) => (
            <NewsArticle
              key={item.id}
              item={item}
              canManage={canManage}
              onDelete={handleDelete}
              onEdit={handleEditArticle}
              isDeletingId={deletingId}
            />
          ))
        )}
      </div>

      {/* In-Context Article Composer Modal */}
      <PublishArticleModal
        isOpen={isPublishModalOpen}
        onClose={() => {
          setIsPublishModalOpen(false);
          setEditingArticle(null);
        }}
        clubId={activeClubId}
        clubName={clubName}
        editingArticle={editingArticle}
        onPermissionDenied={() => setIsRestrictedModalOpen(true)}
      />

      {/* Friendly Permissions Restricted Modal */}
      <PublishRestrictedModal
        isOpen={isRestrictedModalOpen}
        onClose={() => setIsRestrictedModalOpen(false)}
        clubName={clubName}
        onContactLeadership={handleMessageLeadership}
      />
    </div>
  );
};

export default NewsFeed;
