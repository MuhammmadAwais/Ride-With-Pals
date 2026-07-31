/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Bike,
  Bookmark,
  Share2,
  Plus,
  Compass,
  ArrowRight
} from 'lucide-react';
import {
  useGetPublicRidesQuery,
  useGetPublicRidesByDateQuery
} from '@/features/club/api/clubApiSlice';
import {
  useSaveRideMutation,
  useUnsaveRideMutation,
  useGetSavedRidesListQuery
} from '@/features/club/api/savedRidesApiSlice';
import { toast } from 'sonner';

const getRideImage = (img?: string | null): string => {
  if (!img || img === 'null' || img.trim() === '') {
    return '/Images/CycleImage2.png';
  }
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:') || img.startsWith('/')) {
    return img;
  }
  return `https://api.ridewithpals.com/uploads/${img}`;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function UserCalendar() {
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());

  // Format date as YYYY-MM-DD in local time
  const formatYYYYMMDD = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const todayStr = useMemo(() => {
    return formatYYYYMMDD(today.getFullYear(), today.getMonth(), today.getDate());
  }, [today]);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Helper to extract date YYYY-MM-DD from any ride object
  const getRideDateStr = (r: any): string | null => {
    if (!r) return null;
    const raw = r.date || r.rideDate || r.startDate || r.createdAt;
    if (!raw) return null;
    const s = String(raw).trim();
    return s.length >= 10 ? s.slice(0, 10) : null;
  };

  // Fetch all public rides to render calendar dots
  const { data: publicRidesData, isLoading: isLoadingAll } = useGetPublicRidesQuery();
  const allRides = useMemo(() => {
    const res = (publicRidesData as any)?.response?.data ||
                (publicRidesData as any)?.response?.rows ||
                (publicRidesData as any)?.response ||
                (publicRidesData as any)?.data?.data ||
                (publicRidesData as any)?.data?.rows ||
                (publicRidesData as any)?.data ||
                (publicRidesData as any)?.rows ||
                publicRidesData ||
                [];
    return Array.isArray(res) ? res : [];
  }, [publicRidesData]);

  // Map dates to ride count for dots on the calendar grid
  const ridesByDateMap = useMemo(() => {
    const map: Record<string, number> = {};
    allRides.forEach((r: any) => {
      const dStr = getRideDateStr(r);
      if (dStr && dStr.length === 10) {
        map[dStr] = (map[dStr] || 0) + 1;
      }
    });
    return map;
  }, [allRides]);

  // Fetch rides specifically for the selected date
  const { data: byDateData, isLoading: isLoadingByDate, isFetching: isFetchingByDate } = useGetPublicRidesByDateQuery(
    { date: selectedDate },
    { skip: !selectedDate }
  );

  const selectedDateRides = useMemo(() => {
    const fromApi = (byDateData as any)?.response?.data ||
                    (byDateData as any)?.response?.rows ||
                    (byDateData as any)?.response ||
                    (byDateData as any)?.data?.data ||
                    (byDateData as any)?.data?.rows ||
                    (byDateData as any)?.data ||
                    (byDateData as any)?.rows ||
                    byDateData ||
                    [];
    const apiList = Array.isArray(fromApi) ? fromApi : [];
    if (apiList.length > 0) return apiList;

    // Fallback: filter from allRides if by-date endpoint returns empty
    return allRides.filter((r: any) => {
      return getRideDateStr(r) === selectedDate;
    });
  }, [byDateData, allRides, selectedDate]);

  // Saved rides hooks
  const { data: savedData } = useGetSavedRidesListQuery();
  const savedList = useMemo(() => {
    const list = (savedData as any)?.response?.rows || (savedData as any)?.response || savedData || [];
    return Array.isArray(list) ? list : [];
  }, [savedData]);
  const [saveRide] = useSaveRideMutation();
  const [unsaveRide] = useUnsaveRideMutation();

  const isRideSaved = (rideId: number) => {
    return savedList.some((sr: any) => (sr.rideId || sr.id) === rideId);
  };

  const handleToggleSave = async (rideId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isRideSaved(rideId)) {
        await unsaveRide({ rideId }).unwrap();
        toast.success('Ride removed from saved list.');
      } else {
        await saveRide({ rideId }).unwrap();
        toast.success('Ride saved successfully!');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update saved rides.');
    }
  };

  const handleShareRide = (ride: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/view/userside/dashboard/ride/${ride.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success('Ride link copied to clipboard!');
    } else {
      toast.info(`Share link: ${url}`);
    }
  };

  const handleAddToGoogleCalendar = (ride: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const title = encodeURIComponent(ride.rideName || ride.title || 'Scheduled Ride');
    const details = encodeURIComponent(
      `${ride.description || 'Join us for a Ride With Pals club ride!'}\n\nPace: ${ride.pace || 'Moderate'}\nDistance: ${ride.distance || 'N/A'}\nOrganized by: ${ride.user?.fullName || 'Club Admin'}`
    );
    const location = encodeURIComponent(ride.meetingPoint || ride.location || 'TBD');

    let startTimeString = '';
    let endTimeString = '';
    try {
      const dateStr = ride.date ? ride.date.slice(0, 10).replace(/-/g, '') : selectedDate.replace(/-/g, '');
      const timeStr = ride.time ? ride.time.replace(/:/g, '').slice(0, 4) + '00' : '080000';
      startTimeString = `${dateStr}T${timeStr}Z`;
      const startHour = Number(timeStr.slice(0, 2));
      const endHour = String(Math.min(23, startHour + 2)).padStart(2, '0');
      endTimeString = `${dateStr}T${endHour}${timeStr.slice(2)}Z`;
    } catch {
      startTimeString = '20260730T080000Z';
      endTimeString = '20260730T100000Z';
    }

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startTimeString}/${endTimeString}`;
    window.open(googleCalUrl, '_blank', 'noopener,noreferrer');
    toast.success('Opened Google Calendar template!');
  };

  // Calendar month calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean; dateStr: string }> = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevDaysInMonth - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateStr: formatYYYYMMDD(y, m, d)
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateStr: formatYYYYMMDD(currentYear, currentMonth, d)
      });
    }

    // Next month padding to fill 42 cells (6 rows)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateStr: formatYYYYMMDD(y, m, d)
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const formattedSelectedDateLabel = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    if (!year || isNaN(month) || isNaN(day)) return selectedDate;
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDate]);

  return (
    <div className="flex min-h-screen text-text-main font-sans w-full justify-center p-4 sm:p-8">
      <div className="flex-1 transition-all max-w-7xl w-full mx-auto space-y-10">

        {/* Top Title Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/[0.06] pb-8">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#EB712B] mb-3 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EB712B] animate-pulse" />
              Ride Schedule
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-text-main">
              CALENDAR
            </h1>
            <p className="text-text-muted text-xs tracking-wide mt-2 font-medium max-w-lg">
              Explore scheduled club rides by date. Click any date with a dot to view ride details and add them to your Google Calendar.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/view/userside/rides')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-surface border border-border hover:bg-hover text-text-main rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              <Compass size={16} className="text-[#EB712B]" />
              Explore All Rides
            </button>
            <button
              onClick={() => navigate('/view/userside/rides?create=true')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-[#EB712B]/20 transition-all hover:scale-105 active:scale-95 border border-[#EB712B]/30"
            >
              <Plus size={16} />
              Create Ride
            </button>
          </div>
        </div>

        {/* Main Grid: Left Calendar / Right Rides Agenda */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left / Top: Interactive Calendar Card */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Header / Month Controller */}
            <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
              <div className="flex items-center gap-3">
                <CalendarIcon size={24} className="text-[#EB712B]" />
                <h2 className="text-2xl font-black uppercase tracking-wider text-text-main">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  aria-label="Previous Month"
                  className="p-3 bg-white/5 hover:bg-white/10 border border-border rounded-2xl transition-all cursor-pointer text-text-main hover:text-[#EB712B]"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => {
                    setCurrentYear(today.getFullYear());
                    setCurrentMonth(today.getMonth());
                    setSelectedDate(todayStr);
                  }}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-border rounded-2xl transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest text-text-main hover:text-[#EB712B]"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  aria-label="Next Month"
                  className="p-3 bg-white/5 hover:bg-white/10 border border-border rounded-2xl transition-all cursor-pointer text-text-main hover:text-[#EB712B]"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center mb-3">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="py-2 text-[11px] font-black uppercase tracking-widest text-text-muted">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((item, idx) => {
                const isSelected = item.dateStr === selectedDate;
                const isToday = item.dateStr === todayStr;
                const rideCount = ridesByDateMap[item.dateStr] || 0;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center p-2 transition-all duration-300 relative group cursor-pointer border ${
                      isSelected
                        ? 'bg-[#EB712B] text-white border-[#EB712B] shadow-lg shadow-[#EB712B]/30 scale-[1.02]'
                        : item.isCurrentMonth
                        ? 'bg-main-bg/60 hover:bg-white/10 border-border/80 text-text-main'
                        : 'bg-transparent text-text-muted/40 border-transparent hover:border-border/30'
                    }`}
                  >
                    {/* Today indicator positioned in top-right so number stays perfectly centered */}
                    {isToday && (
                      <span className={`absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#EB712B]/20 text-[#EB712B]'
                      }`}>
                        Today
                      </span>
                    )}

                    {/* Centered Day Number */}
                    <span className={`text-sm sm:text-base font-black leading-none ${
                      isSelected ? 'text-white' : item.isCurrentMonth ? 'text-text-main' : 'text-text-muted/40'
                    }`}>
                      {item.day}
                    </span>

                    {/* Ride Dots Indicator centered below the date */}
                    <div className="flex items-center justify-center gap-1 mt-1.5 min-h-[8px]">
                      {rideCount > 0 && (
                        <div className="flex items-center gap-1" title={`${rideCount} ride${rideCount > 1 ? 's' : ''} scheduled`}>
                          <span className={`w-2 h-2 rounded-full transition-all ${
                            isSelected ? 'bg-white shadow-sm' : 'bg-[#EB712B] animate-pulse shadow-[0_0_8px_rgba(235,113,43,0.8)]'
                          }`} />
                          {rideCount > 1 && (
                            <span className={`text-[9px] font-black ${
                              isSelected ? 'text-white/90' : 'text-[#EB712B]'
                            }`}>
                              +{rideCount - 1}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/60 text-[11px] font-bold text-text-muted uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EB712B] shadow-[0_0_8px_rgba(235,113,43,0.8)]" />
                <span>Scheduled Ride Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-lg bg-[#EB712B] text-white flex items-center justify-center text-[9px]">✓</span>
                <span>Selected Date</span>
              </div>
            </div>
          </div>

          {/* Right / Bottom: Selected Date Rides Agenda */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header for Selected Date */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#EB712B]">
                  Selected Agenda
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-text-main mt-1">
                  {formattedSelectedDateLabel}
                </h3>
              </div>
              <span className="px-3.5 py-1.5 bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20 rounded-xl text-xs font-black uppercase">
                {selectedDateRides.length} {selectedDateRides.length === 1 ? 'Ride' : 'Rides'}
              </span>
            </div>

            {/* Rides List for Selected Date */}
            {isLoadingAll || (isLoadingByDate && isFetchingByDate) ? (
              <div className="bg-surface border border-border rounded-3xl p-12 text-center text-text-muted space-y-3">
                <div className="w-8 h-8 border-2 border-[#EB712B] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold uppercase tracking-wider">Loading rides for date...</p>
              </div>
            ) : selectedDateRides.length === 0 ? (
              <div className="bg-surface border border-border rounded-3xl p-12 text-center text-text-muted space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-border">
                  <Bike size={28} className="text-text-muted" />
                </div>
                <div>
                  <h4 className="text-base font-black uppercase text-text-main">No Rides Scheduled</h4>
                  <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
                    There are no club rides scheduled for this day. Why not organize one?
                  </p>
                </div>
                <button
                  onClick={() => navigate('/view/userside/rides')}
                  className="px-6 py-3 bg-[#EB712B] hover:bg-[#ff8036] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  Explore All Rides <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[650px] overflow-y-auto custom-scrollbar pr-1">
                {selectedDateRides.map((ride: any) => {
                  const isSaved = isRideSaved(ride.id);

                  return (
                    <div
                      key={ride.id}
                      onClick={() => navigate(`/view/userside/dashboard/ride/${ride.id}`)}
                      className="bg-surface border border-border rounded-3xl p-5 hover:border-[#EB712B]/40 transition-all duration-300 hover:shadow-xl cursor-pointer group flex flex-col gap-4 relative overflow-hidden"
                    >
                      {/* Top Bar: Title & Action Buttons */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-lg font-black uppercase text-text-main group-hover:text-[#EB712B] transition-colors truncate">
                            {ride.rideName || ride.title || 'Club Ride'}
                          </h4>
                          <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                            <Clock size={13} className="text-[#EB712B] shrink-0" />
                            <span>
                              {ride.date ? String(ride.date).slice(0, 10) : selectedDate}
                              {ride.time ? ` — ${ride.time}` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Top Right Action Icons */}
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleAddToGoogleCalendar(ride, e)}
                            title="Add to Google Calendar"
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#EB712B] text-text-main hover:text-white border border-border hover:border-transparent transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                          >
                            <CalendarIcon size={13} />
                            <span>Google Cal</span>
                          </button>

                          <button
                            onClick={(e) => handleToggleSave(ride.id, e)}
                            title={isSaved ? 'Unsave Ride' : 'Save Ride'}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isSaved
                                ? 'bg-[#EB712B]/10 border-[#EB712B]/30 text-[#EB712B]'
                                : 'bg-white/5 hover:bg-white/10 border-border text-text-muted hover:text-text-main'
                            }`}
                          >
                            <Bookmark size={15} className={isSaved ? 'fill-current' : ''} />
                          </button>

                          <button
                            onClick={(e) => handleShareRide(ride, e)}
                            title="Share Ride"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-border text-text-muted hover:text-text-main transition-all cursor-pointer"
                          >
                            <Share2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Location & Meeting Point */}
                      <div className="flex items-center gap-2 text-xs font-bold text-text-muted min-w-0 bg-main-bg/50 p-3 rounded-2xl border border-border/50">
                        <MapPin size={15} className="text-[#EB712B] shrink-0" />
                        <span className="truncate">
                          {ride.meetingPoint || ride.location || 'Meeting point TBD'}
                        </span>
                      </div>

                      {/* Stats Pills */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-main-bg/60 border border-border/60 rounded-2xl p-2.5 text-center">
                          <span className="block text-[9px] font-bold text-text-muted uppercase">Pace</span>
                          <span className="text-xs font-black uppercase text-text-main mt-0.5 block truncate">
                            {ride.pace || 'Moderate'}
                          </span>
                        </div>
                        <div className="bg-main-bg/60 border border-border/60 rounded-2xl p-2.5 text-center">
                          <span className="block text-[9px] font-bold text-text-muted uppercase">Distance</span>
                          <span className="text-xs font-black uppercase text-text-main mt-0.5 block truncate">
                            {ride.distance ? `${ride.distance} km` : 'N/A'}
                          </span>
                        </div>
                        <div className="bg-main-bg/60 border border-border/60 rounded-2xl p-2.5 text-center">
                          <span className="block text-[9px] font-bold text-text-muted uppercase">Participants</span>
                          <span className="text-xs font-black uppercase text-text-main mt-0.5 block truncate">
                            {ride.participantCount || ride.joinedParticipants?.length || ride.membersCount || 1}
                          </span>
                        </div>
                      </div>

                      {/* Footer: Organizer & View Arrow */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs font-bold text-text-muted">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={getRideImage(ride.user?.profileImage || ride.club?.logo)}
                            alt="Organizer"
                            className="w-6 h-6 rounded-full object-cover border border-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/Images/CycleImage2.png';
                            }}
                          />
                          <span className="text-[11px] text-text-muted font-bold truncate">
                            {ride.user?.fullName || ride.user?.firstName || ride.club?.clubName || 'Club Admin'}
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#EB712B] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          View Ride &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
