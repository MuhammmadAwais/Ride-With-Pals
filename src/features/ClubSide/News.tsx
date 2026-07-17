import React, { useState, useMemo } from 'react';
import { MessageSquare, Plus, ArrowUpRight, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useGetAllNewsQuery, useGetAllNewsCommentsQuery, useAddCommentMutation, useDelCommentMutation } from '@/features/club/api/newsApiSlice';
import { useGetJoinedClubsQuery } from '@/features/club/api/clubApiSlice';

const ArticleComments = ({ newsId }: { newsId: number }) => {
  const [newComment, setNewComment] = useState("");
  const { data: commentsData, isLoading } = useGetAllNewsCommentsQuery({ newsId });
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [deleteComment] = useDelCommentMutation();

  const comments = commentsData?.rows || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addComment({ newsId, comment: newComment.trim() }).unwrap();
      setNewComment("");
      toast.success("Comment posted successfully!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to post comment.");
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteComment({ newsId, newsCommentId: commentId }).unwrap();
      toast.success("Comment deleted successfully!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete comment.");
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-border space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">Comments ({comments.length})</h4>
      
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-10 bg-[#222] rounded-xl" />
          <div className="h-10 bg-[#222] rounded-xl" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-text-muted">No comments yet. Be the first to write one!</p>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {comments.map((comment: any) => (
            <div key={comment.id} className="flex justify-between items-start gap-4 p-3 bg-hover rounded-2xl border border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-main">{comment.user?.fullName || "User"}</span>
                  <span className="text-[8px] text-text-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{comment.comment}</p>
              </div>
              <button 
                onClick={() => handleDelete(comment.id)} 
                className="text-[9px] font-bold uppercase text-red-500 hover:text-red-400 cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          placeholder="Write a comment..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 bg-surface border border-border px-4 py-2.5 rounded-xl text-xs text-text-main focus:outline-none focus:border-[#EB712B]/40"
        />
        <button 
          type="submit" 
          disabled={isAdding}
          className="px-4 py-2.5 bg-[#EB712B] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#ff8036] disabled:opacity-50 cursor-pointer"
        >
          {isAdding ? "..." : "Post"}
        </button>
      </form>
    </div>
  );
};

const NewsArticle = ({ item }: { item: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="group relative bg-surface border border-border rounded-3xl p-6 sm:p-8 overflow-hidden transition-all duration-700 ease-out hover:border-[#EB712B]/40 hover:-translate-y-1 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-[#EB712B]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        {/* Icon - Hidden on very small screens or kept small */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center rounded-2xl bg-hover border border-border group-hover:bg-[#EB712B] group-hover:scale-105 transition-all duration-500 ease-in-out">
          <Newspaper className="text-[#EB712B] group-hover:text-white transition-colors duration-500" size={24} />
        </div>

        <div className="flex-1 space-y-4 w-full">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-main group-hover:text-[#EB712B] transition-colors duration-300 leading-tight">
                {item.title}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">{item.date}</p>
            </div>
            <div className="shrink-0 group-hover:translate-x-1 transition-transform duration-300">
              <ArrowUpRight className="text-text-muted opacity-50 group-hover:text-[#EB712B] transition-colors" size={20} />
            </div>
          </div>

          <div className="transition-all duration-500 ease-in-out space-y-4">
            <p className="text-sm text-text-muted leading-relaxed">
              {item.previewText}
              {!isExpanded && (
                <button onClick={() => setIsExpanded(true)} className="ml-2 font-bold text-[#EB712B] underline underline-offset-4 cursor-pointer">
                  Read More
                </button>
              )}
            </p>

            {isExpanded && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                {item.image && (
                  <img src={item.image} alt="Article visual" className="w-full h-40 sm:h-48 object-cover rounded-2xl border border-border" />
                )}
                <p className="text-sm text-text-muted leading-relaxed">
                  {item.fullContent}
                  <button onClick={() => setIsExpanded(false)} className="ml-2 font-bold text-[#EB712B] underline underline-offset-4 cursor-pointer">
                    Show Less
                  </button>
                </p>
                
                {/* Embedded comments section */}
                <ArticleComments newsId={Number(item.id)} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-[8px] font-black text-[#EB712B] border border-border">{item.authorInitials}</div>
              <span className="text-xs font-bold text-text-main truncate max-w-[100px]">{item.author}</span>
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-[#EB712B] transition-colors cursor-pointer"
            >
              <MessageSquare size={12} /> {item.totalCommentsCount || 0}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

interface NewsFeedProps {
  clubId?: string | number;
}

const NewsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-surface/50 border border-border rounded-3xl p-8 flex flex-col sm:flex-row gap-6">
        <div className="w-14 h-14 bg-border rounded-2xl shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="w-2/3 h-6 bg-border rounded" />
          <div className="w-24 h-3 bg-border rounded" />
          <div className="w-full h-12 bg-border/40 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';

export const NewsFeed: React.FC<NewsFeedProps> = ({ clubId }) => {
  const { clubId: activeClubIdRedux, setActiveClub } = useActiveClub();
  let activeClubId = clubId || activeClubIdRedux;
  const permissions = useClubPermissions(activeClubId || undefined);
  
  const { data: joinedClubs } = useGetJoinedClubsQuery(undefined, { skip: !!activeClubId });
  const joinedRows = joinedClubs?.rows || [];

  if (!activeClubId && joinedRows.length > 0) {
    activeClubId = joinedRows[0].id.toString();
    setActiveClub(joinedRows[0] as any);
  }

  const { data: newsData, isLoading } = useGetAllNewsQuery(
    { clubId: Number(activeClubId) },
    { skip: !activeClubId }
  );

  const newsItems = useMemo(() => {
    const items = newsData?.rows || [];
    return items.map((item: any, index: number) => ({
      id: item.id?.toString() || index.toString(),
      title: item.title || "Untitled Article",
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent",
      previewText: item.description || (item.content ? item.content.slice(0, 150) + "..." : "No description provided."),
      fullContent: item.description || "No content provided.",
      image: item.image || item.imageUrl || null,
      author: item.author || "Club Admin",
      authorInitials: (item.author || "Club Admin").slice(0, 2).toUpperCase(),
      totalCommentsCount: item.totalCommentsCount || 0
    }));
  }, [newsData]);

  return (
    <div className="min-h-screen text-text-main bg-main-bg p-4 sm:p-6 md:p-16 font-sans">
      <header className="max-w-4xl mx-auto mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter text-text-main">Community News</h1>
          {permissions.canPublishNews && (
            <Link 
              to="/news/add" 
              className="flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-[#EB712B]/50 text-[#EB712B] rounded-xl hover:bg-[#EB712B] hover:text-white transition-all duration-300 text-xs font-bold tracking-widest w-full sm:w-auto text-center"
            >
              <Plus size={18} /> Add new Post
            </Link>
          )}
        </div>
      </header>
      <main className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {isLoading ? (
          <NewsSkeleton />
        ) : newsItems.length === 0 ? (
          <div className="bg-surface rounded-3xl border border-border p-12 text-center text-text-muted">
            No news articles available yet.
          </div>
        ) : (
          newsItems.map((item) => <NewsArticle key={item.id} item={item} />)
        )}
      </main>
    </div>
  );
};

export default NewsFeed;
