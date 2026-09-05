/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
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
  ArrowRight,
  Check
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
import { resolveImageUrl } from '../services/clubGeocoding';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to format time into human-friendly 12-hour AM/PM format
const formatHumanTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  const clean = String(timeStr).trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return clean;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
};

// Helper to resolve ride cover image with reliable fallback
const getRideCoverImage = (ride: any): string => {
  const raw =
    ride.coverImage ||
    ride.image ||
    ride.bannerImage ||
    ride.routeImage ||
    ride.media ||
    ride.club?.coverImage ||
    ride.club?.bannerImage ||
    ride.club?.logo;
  return resolveImageUrl(raw) || '/Images/CyclingPicture.jpg';
};

// Helper for sport badge label
const getRideSport = (ride: any): string => {
  const t = ride.sportType || ride.rideType || ride.type || ride.club?.clubType || '';
  const str = String(t).toLowerCase();
  if (str.includes('run')) return 'Running';
  if (str.includes('triathlon')) return 'Triathlon';
  return 'Cycling';
};

// Robust Organizer Avatar Component with graceful fallback
const OrganizerAvatar = ({ src, name }: { src?: string | null; name: string }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const resolved = useMemo(() => {
    if (!src || hasError) return null;
    const url = resolveImageUrl(src);
    return url || null;
  }, [src, hasError]);

  const initials = useMemo(() => {
    const parts = (name || 'Admin').trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name || 'A').slice(0, 2).toUpperCase();
  }, [name]);

  if (!resolved || hasError) {
    return (
      <div className="w-6 h-6 rounded-full bg-hover border border-border flex items-center justify-center font-bold text-[#EB712B] text-[9px] uppercase shrink-0">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={name}
      onError={() => setHasError(true)}
      className="w-6 h-6 rounded-full object-cover border border-border shrink-0"
    />
  );
};

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
    const res =
      (publicRidesData as any)?.response?.data ||
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

  // Total rides in the currently viewed month
  const currentMonthRideCount = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    return allRides.filter((r: any) => {
      const d = getRideDateStr(r);
      return d && d.startsWith(prefix);
    }).length;
  }, [allRides, currentYear, currentMonth]);

  // Fetch rides specifically for the selected date
  const {
    data: byDateData,
    isLoading: isLoadingByDate,
    isFetching: isFetchingByDate
  } = useGetPublicRidesByDateQuery(
    { date: selectedDate },
    { skip: !selectedDate }
  );

  const selectedDateRides = useMemo(() => {
    const fromApi =
      (byDateData as any)?.response?.data ||
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
    const list =
      (savedData as any)?.response?.rows ||
      (savedData as any)?.response ||
      savedData ||
      [];
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

  const isSelectedDateToday = selectedDate === todayStr;

  return (
    <div className="min-h-screen bg-main-bg text-text-main font-sans w-full p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── TOP BANNER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EB712B]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#EB712B] font-bold">
                RIDE SCHEDULE & AGENDA
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase text-text-main">
              Calendar
            </h1>
            <p className="text-text-muted text-xs font-medium max-w-xl leading-relaxed">
              Explore scheduled rides across clubs. Select any calendar date to view the daily briefing, meeting points, and export directly to Google Calendar.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/view/userside/rides')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface border border-border hover:bg-hover text-text-main rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              <Compass size={14} className="text-[#EB712B]" />
              Explore All Rides
            </button>
            <button
              onClick={() => navigate('/view/userside/rides?create=true')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
            >
              <Plus size={15} />
              Create Ride
            </button>
          </div>
        </div>

        {/* ── MAIN 2-COLUMN LAYOUT: Balanced Calendar & Rich Agenda ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ── LEFT: COMPACT MODERN CALENDAR ── */}
          <div className="lg:col-span-5 xl:col-span-5 bg-surface border border-border rounded-3xl p-5 sm:p-6 space-y-4">
            
            {/* Header: Month & Navigation */}
            <div className="flex items-center justify-between pb-3.5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-hover border border-border flex items-center justify-center text-[#EB712B]">
                  <CalendarIcon size={16} />
                </div>
                <h2 className="text-base font-black uppercase tracking-wider text-text-main">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  aria-label="Previous Month"
                  className="w-8 h-8 flex items-center justify-center bg-hover hover:bg-surface border border-border rounded-xl transition-colors cursor-pointer text-text-main hover:text-[#EB712B]"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => {
                    setCurrentYear(today.getFullYear());
                    setCurrentMonth(today.getMonth());
                    setSelectedDate(todayStr);
                  }}
                  className="px-2.5 py-1.5 bg-hover hover:bg-[#EB712B] hover:text-white border border-border rounded-xl transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider text-text-muted"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  aria-label="Next Month"
                  className="w-8 h-8 flex items-center justify-center bg-hover hover:bg-surface border border-border rounded-xl transition-colors cursor-pointer text-text-main hover:text-[#EB712B]"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center py-1.5">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {d}
                </div>
              ))}
            </div>

            {/* Date Cells Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarDays.map((item, idx) => {
                const isSelected = item.dateStr === selectedDate;
                const isToday = item.dateStr === todayStr;
                const rideCount = ridesByDateMap[item.dateStr] || 0;

                let stateClasses = '';
                if (isSelected) {
                  stateClasses = 'bg-[#EB712B] text-white font-black border-[#EB712B]';
                } else if (isToday) {
                  stateClasses = 'border border-[#EB712B] text-[#EB712B] bg-transparent font-bold hover:bg-hover';
                } else if (item.isCurrentMonth) {
                  stateClasses = 'text-text-main hover:bg-hover font-semibold border-transparent';
                } else {
                  stateClasses = 'text-text-muted/40 hover:text-text-muted font-normal border-transparent';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`h-10 sm:h-11 w-full max-w-[44px] mx-auto rounded-xl flex flex-col items-center justify-center p-1 border transition-colors cursor-pointer ${stateClasses}`}
                  >
                    <span className="text-xs sm:text-sm leading-none">
                      {item.day}
                    </span>

                    {/* Crisp solid indicator dot */}
                    <div className="flex items-center justify-center gap-0.5 mt-1 h-1.5">
                      {rideCount > 0 && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-[#EB712B]'
                          }`}
                        />
                      )}
                      {rideCount > 1 && (
                        <span
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? 'bg-white/70' : 'bg-[#EB712B]/70'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clean Legend & Stats */}
            <div className="pt-3.5 border-t border-border flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-wider">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EB712B]" />
                  <span>Scheduled Ride</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full border border-[#EB712B]" />
                  <span>Today</span>
                </div>
              </div>

              <span className="text-text-muted font-bold">
                {currentMonthRideCount} {currentMonthRideCount === 1 ? 'ride' : 'rides'} in {MONTH_NAMES[currentMonth].slice(0, 3)}
              </span>
            </div>

          </div>

          {/* ── RIGHT: HUMAN-FRIENDLY SELECTED DAY AGENDA WITH RIDE IMAGES ── */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4">
            
            {/* Header: Human Language Title & Status */}
            <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#EB712B] font-bold">
                    {isSelectedDateToday ? 'TODAY’S SCHEDULE' : 'SELECTED DATE'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-text-main uppercase tracking-tight mt-0.5">
                  {formattedSelectedDateLabel}
                </h3>
              </div>
              <span className="px-3.5 py-1.5 bg-hover border border-border text-text-main rounded-xl text-xs font-bold uppercase tracking-wider self-start sm:self-auto shrink-0">
                {selectedDateRides.length} {selectedDateRides.length === 1 ? 'Ride Scheduled' : 'Rides Scheduled'}
              </span>
            </div>

            {/* Rides List or Empty State */}
            {isLoadingAll || (isLoadingByDate && isFetchingByDate) ? (
              <div className="bg-surface border border-border rounded-3xl p-12 text-center text-text-muted space-y-3">
                <div className="w-7 h-7 border-2 border-[#EB712B] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold uppercase tracking-wider">Syncing schedule...</p>
              </div>
            ) : selectedDateRides.length === 0 ? (
              <div className="bg-surface border border-border rounded-3xl p-10 sm:p-14 text-center text-text-muted space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-hover border border-border flex items-center justify-center mx-auto text-text-muted">
                  <Bike size={22} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black uppercase text-text-main">No Rides on this Date</h4>
                  <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                    There are no club rides scheduled for {formattedSelectedDateLabel}. You can choose another marked day on the calendar or create a new ride for the club.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => navigate('/view/userside/rides?create=true')}
                    className="px-5 py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Create Ride
                  </button>
                  <button
                    onClick={() => navigate('/view/userside/rides')}
                    className="px-5 py-2.5 bg-surface border border-border hover:bg-hover text-text-main text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Browse All Rides
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[720px] overflow-y-auto pr-1">
                {selectedDateRides.map((ride: any) => {
                  const isSaved = isRideSaved(ride.id);
                  const rideImage = getRideCoverImage(ride);
                  const organizerName =
                    ride.user?.fullName ||
                    ride.user?.firstName ||
                    ride.club?.clubName ||
                    'Club Admin';
                  const organizerPhoto =
                    ride.user?.profileImage ||
                    ride.user?.profilePhoto ||
                    ride.club?.logo;
                  const rideSport = getRideSport(ride);
                  const rideTitle = ride.rideName || ride.title || 'Club Ride';
                  const rideLocation = ride.meetingPoint || ride.location || 'Meeting point specified upon joining';
                  const formattedTime = formatHumanTime(ride.time);
                  const rideDistance = ride.distance ? `${ride.distance} km` : 'Open Distance';
                  const ridePace = ride.pace ? `${ride.pace} min/km` : (ride.speed ? `${ride.speed} km/h` : 'Moderate');
                  const rideParticipants =
                    ride.participantCount ||
                    ride.joinedParticipantsCount ||
                    (Array.isArray(ride.joinedParticipants) ? ride.joinedParticipants.length : null) ||
                    ride.membersCount ||
                    1;

                  return (
                    <div
                      key={ride.id}
                      onClick={() => navigate(`/view/userside/dashboard/ride/${ride.id}`)}
                      className="bg-surface border border-border hover:border-[#EB712B]/40 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group flex flex-col"
                    >
                      {/* ── RIDE COVER IMAGE WITH SCRIM & QUICK ACTIONS ── */}
                      <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-black/50">
                        <img
                          src={rideImage}
                          alt={rideTitle}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/Images/CycleImage2.png';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-black/50" />

                        {/* Top Badges & Actions */}
                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 border border-white/10 text-[10px] font-black uppercase tracking-wider text-[#EB712B]">
                              <Bike size={12} />
                              {rideSport}
                            </span>
                            {ride.club?.clubName && (
                              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-black/70 border border-white/10 text-[10px] font-bold text-white/90 truncate max-w-[140px]">
                                {ride.club.clubName}
                              </span>
                            )}
                          </div>

                          {/* Top-Right Quick Action Icons */}
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleAddToGoogleCalendar(ride, e)}
                              title="Add to Google Calendar"
                              className="px-2.5 py-1.5 rounded-lg bg-black/70 hover:bg-[#EB712B] text-white border border-white/15 hover:border-transparent transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                            >
                              <CalendarIcon size={12} />
                              <span>Google Cal</span>
                            </button>

                            <button
                              onClick={(e) => handleToggleSave(ride.id, e)}
                              title={isSaved ? 'Unsave Ride' : 'Save Ride'}
                              className={`p-1.5 rounded-lg bg-black/70 border transition-colors cursor-pointer ${
                                isSaved
                                  ? 'border-[#EB712B]/50 text-[#EB712B]'
                                  : 'border-white/15 text-white/80 hover:text-white'
                              }`}
                            >
                              <Bookmark size={13} className={isSaved ? 'fill-current' : ''} />
                            </button>

                            <button
                              onClick={(e) => handleShareRide(ride, e)}
                              title="Share Ride"
                              className="p-1.5 rounded-lg bg-black/70 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 transition-colors cursor-pointer"
                            >
                              <Share2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Bottom Image Overlay: Time pill */}
                        {formattedTime && (
                          <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white font-bold text-xs bg-black/70 px-2.5 py-1 rounded-lg border border-white/15">
                            <Clock size={12} className="text-[#EB712B]" />
                            <span>{formattedTime}</span>
                          </div>
                        )}
                      </div>

                      {/* ── RIDE DETAILS BODY ── */}
                      <div className="p-5 space-y-4">
                        <div>
                          <h4 className="text-lg font-black uppercase text-text-main group-hover:text-[#EB712B] transition-colors leading-snug">
                            {rideTitle}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1.5 font-medium">
                            <MapPin size={14} className="text-[#EB712B] shrink-0" />
                            <span className="truncate">{rideLocation}</span>
                          </div>
                        </div>

                        {/* Telemetry Pills */}
                        <div className="grid grid-cols-3 gap-2 py-1">
                          <div className="bg-main-bg border border-border rounded-xl p-2.5 text-center">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Distance</span>
                            <span className="text-xs font-black uppercase text-text-main mt-0.5 block truncate">
                              {rideDistance}
                            </span>
                          </div>
                          <div className="bg-main-bg border border-border rounded-xl p-2.5 text-center">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Pace</span>
                            <span className="text-xs font-black uppercase text-text-main mt-0.5 block truncate">
                              {ridePace}
                            </span>
                          </div>
                          <div className="bg-main-bg border border-border rounded-xl p-2.5 text-center">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Riders</span>
                            <span className="text-xs font-black uppercase text-text-main mt-0.5 block truncate">
                              {rideParticipants}
                            </span>
                          </div>
                        </div>

                        {/* Footer: Organizer & View Details Arrow */}
                        <div className="flex items-center justify-between pt-3 border-t border-border text-xs font-semibold text-text-muted">
                          <div className="flex items-center gap-2">
                            <OrganizerAvatar src={organizerPhoto} name={organizerName} />
                            <span className="text-xs text-text-main font-bold truncate max-w-[170px]">
                              {organizerName}
                            </span>
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#EB712B] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            View Details <ArrowRight size={13} />
                          </span>
                        </div>
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
