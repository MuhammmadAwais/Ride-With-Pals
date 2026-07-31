/**
 * @fileoverview SavedRides — Athlete-only page.
 *
 * Flutter equivalent: /user/rides/saved
 * Lists rides the authenticated user has bookmarked.
 * Each card has an "Unsave" button to remove from the list.
 *
 * Architecture:
 * - No clubId needed — relies on auth token only
 * - Uses useGetSavedRidesListQuery + useUnsaveRideMutation
 * - Strictly athlete-side (no club management equivalent)
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  BookmarkX,
  Calendar,
  MapPin,
  Bike,
  Search,
  X,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetSavedRidesListQuery, useUnsaveRideMutation } from '@/features/club/api/savedRidesApiSlice';

// ── Skeleton ───────────────────────────────────────────────────────────────────

const SavedRideSkeleton = () => (
  <div className="bg-main-bg border border-border rounded-2xl overflow-hidden animate-pulse">
    <div className="h-40 bg-[#222]" />
    <div className="p-5 space-y-3">
      <div className="w-3/4 h-4 bg-[#222] rounded" />
      <div className="w-1/2 h-3 bg-[#222] rounded" />
      <div className="flex gap-2 pt-2">
        <div className="flex-1 h-10 bg-[#222] rounded-xl" />
        <div className="w-20 h-10 bg-[#222] rounded-xl" />
      </div>
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────

const SavedRides: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const { data: savedData, isLoading, isError } = useGetSavedRidesListQuery();
  const [unsaveRide] = useUnsaveRideMutation();

  const rawRides = useMemo(() => {
    const items = savedData?.rows || [];
    return Array.isArray(items) ? items : [];
  }, [savedData]);

  const rides = useMemo(() => {
    return rawRides.map((item: any) => {
      const logoPath = item.ride?.club?.logo || item.ride?.club?.coverImage || item.club?.logo || item.coverImage;
      let bannerImage = '/Images/CycleImage2.png';
      if (logoPath && logoPath !== 'null' && logoPath.trim() !== '') {
        bannerImage = (logoPath.startsWith('http://') || logoPath.startsWith('https://') || logoPath.startsWith('/'))
          ? logoPath
          : `https://api.ridewithpals.com/uploads/${logoPath}`;
      }
      const rideData = item.ride || item;
      return {
        id: item.rideId || rideData.id,
        title: rideData.ridename || rideData.title || rideData.name || 'Unnamed Ride',
        clubName: rideData.club?.clubName || 'Independent',
        date: rideData.date || rideData.startDate || 'TBD',
        location: rideData.meetingPoint || rideData.location || 'TBD',
        rideType: rideData.sportSubTypeName || rideData.activityTypeName || rideData.type || 'Road',
        participants: rideData.joinedParticipantsCount?.toString() || '0',
        image: bannerImage,
      };
    });
  }, [rawRides]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return rides;
    const q = searchQuery.toLowerCase();
    return rides.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.clubName.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
    );
  }, [rides, searchQuery]);

  const handleUnsave = async (rideId: number) => {
    setRemovingIds((prev) => new Set(prev).add(rideId));
    try {
      await unsaveRide({ rideId }).unwrap();
      toast.success('Ride removed from saved list.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to remove ride.');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(rideId);
        return next;
      });
    }
  };

  const handleJoinRide = (rideId: number) => {
    navigate(`/view/userside/dashboard/ride/${rideId}`);
  };

  return (
    <div className="min-h-screen text-text-main bg-main-bg p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
          <div className="space-y-2 relative">
            <div className="absolute -left-10 top-0 w-20 h-20 bg-[#EB712B]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-xl flex items-center justify-center">
                <Bookmark size={18} className="text-[#EB712B]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#EB712B]">Athlete Library</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-main">
              Saved Activities
            </h1>
            <p className="text-text-muted font-medium text-sm max-w-xl">
              Your personal collection of bookmarked group activities.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Search saved activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border pl-11 pr-10 py-3 rounded-xl text-xs text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 text-xs text-text-muted">
          <span className="font-bold text-text-main">{rides.length}</span> saved activities
          {searchQuery && (
            <>
              <span className="text-border">·</span>
              <span className="font-bold text-[#EB712B]">{filtered.length}</span> matching search
            </>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SavedRideSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="bg-surface border border-border rounded-3xl p-12 text-center space-y-3">
            <p className="text-red-500 font-bold uppercase text-xs tracking-wider">Failed to load saved activities.</p>
            <p className="text-text-muted text-sm">Please check your connection and try again.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-3xl p-16 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-2xl flex items-center justify-center">
              <BookmarkX size={32} className="text-[#EB712B]" />
            </div>
            <h2 className="text-xl font-bold text-text-main">
              {searchQuery ? 'No activities match your search' : 'No Saved Activities Yet'}
            </h2>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'Browse activities and tap the bookmark icon to save them for later.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/view/userside/activities')}
                className="mt-2 px-6 py-3 bg-[#EB712B] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#d05c19] transition-colors cursor-pointer border-0"
              >
                Browse Activities
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((ride) => {
              const isRemoving = removingIds.has(ride.id);
              return (
                <div
                  key={ride.id}
                  className="bg-main-bg border border-border rounded-2xl flex flex-col justify-between hover:border-[#EB712B]/40 transition-all group relative overflow-hidden shadow-2xl"
                >
                  {/* Glow */}
                  <div className="absolute top-40 right-0 w-40 h-40 bg-[#EB712B]/5 rounded-full blur-3xl group-hover:bg-[#EB712B]/10 transition-all duration-500 pointer-events-none" />

                  {/* Banner */}
                  <div className="relative h-40 w-full overflow-hidden border-b border-border shrink-0">
                    <img
                      src={ride.image}
                      alt={ride.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/Images/CycleImage2.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-main-bg via-transparent to-transparent opacity-65" />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-surface/85 backdrop-blur-md border border-border px-2 py-1 rounded-lg">
                      <Flame size={10} className="text-[#EB712B]" />
                      <span className="text-[8px] font-extrabold uppercase text-[#EB712B] tracking-wider">{ride.rideType}</span>
                    </div>
                    {/* Saved indicator */}
                    <div className="absolute top-3 left-3 w-7 h-7 bg-[#EB712B]/90 rounded-lg flex items-center justify-center">
                      <Bookmark size={13} className="text-white fill-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-text-main line-clamp-2 group-hover:text-[#EB712B] transition-colors">
                        {ride.title}
                      </h3>
                      <p className="text-[10px] text-[#EB712B] font-bold uppercase tracking-wider">{ride.clubName}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <Calendar size={10} className="shrink-0" />
                        <span>{ride.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <MapPin size={10} className="shrink-0" />
                        <span className="truncate">{ride.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <Bike size={10} className="shrink-0" />
                        <span>{ride.participants} participants</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-border mt-auto">
                      <button
                        onClick={() => handleJoinRide(ride.id)}
                        className="flex-1 py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 flex items-center justify-center gap-1.5"
                      >
                        View Ride <ArrowRight size={12} />
                      </button>
                      <button
                        onClick={() => handleUnsave(ride.id)}
                        disabled={isRemoving}
                        className="py-2.5 px-3 bg-surface border border-border hover:border-red-500/40 hover:bg-red-500/5 text-text-muted hover:text-red-500 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                        title="Remove from saved"
                      >
                        <BookmarkX size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRides;
