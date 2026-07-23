import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Users, PlusCircle, Loader2 } from 'lucide-react';
import { useGetClubRidesQuery } from '@/features/club/api/clubApiSlice';
import { useActiveClub } from '@/hooks/useActiveClub';

interface CalendarRide {
  id: number;
  title: string;
  date: Date;
  time: string;
  location: string;
  distance: string;
  riders: number;
}

export const DashboardCalendar: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const { clubId } = useActiveClub();

  const { data: ridesData, isLoading } = useGetClubRidesQuery(
    { clubId: Number(clubId) },
    { skip: !clubId }
  );

  const rides = useMemo<CalendarRide[]>(() => {
    const rows = ridesData?.rows || [];
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title || 'Group Ride',
      date: r.rideDate ? new Date(r.rideDate) : new Date(),
      time: r.rideTime || '08:00 AM',
      location: r.startingPoint || r.location || 'Club Headquarters',
      distance: r.distance ? `${r.distance} km` : 'TBD',
      riders: r.joinedMembersCount || r.maxRiders || 0,
    }));
  }, [ridesData]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate calendar days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  const prevMonthDaysToRender = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDaysToRender.push({
      day: prevMonthDays - i,
      month: currentMonth === 0 ? 11 : currentMonth - 1,
      year: currentMonth === 0 ? currentYear - 1 : currentYear,
      isCurrentMonth: false,
    });
  }

  const currentMonthDaysToRender = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDaysToRender.push({
      day: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
    });
  }

  const totalRendered = prevMonthDaysToRender.length + currentMonthDaysToRender.length;
  const nextMonthDaysToRender = [];
  const remainingCells = 42 - totalRendered;
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthDaysToRender.push({
      day: i,
      month: currentMonth === 11 ? 0 : currentMonth + 1,
      year: currentMonth === 11 ? currentYear + 1 : currentYear,
      isCurrentMonth: false,
    });
  }

  const allCalendarDays = [
    ...prevMonthDaysToRender,
    ...currentMonthDaysToRender,
    ...nextMonthDaysToRender,
  ];

  const isSameDayCheck = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const selectedDateRides = rides.filter((ride) => isSameDayCheck(ride.date, selectedDate));

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-black text-white">Calendar</h1>
          <p className="text-text-muted text-xs md:text-sm mt-1">Manage and discover upcoming group rides and training runs.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/rides/create')}
          className="flex items-center gap-2 bg-[#EB712B] text-white px-5 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 cursor-pointer hover:bg-[#d66525] border-0 outline-none"
        >
          <PlusCircle size={16} />
          <span>Host a Ride</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid Card */}
        <div className="lg:col-span-2 bg-surface border border-border p-8 rounded-[32px] shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-lg text-white">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrevMonth}
                  className="p-3 rounded-full bg-surface border border-border text-text-muted hover:text-text-main transition-colors cursor-pointer border-0 outline-none"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-3 rounded-full bg-surface border border-border text-text-muted hover:text-text-main transition-colors cursor-pointer border-0 outline-none"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Days of Week Headers */}
            <div className="grid grid-cols-7 text-center text-xs font-black text-text-muted mb-4 uppercase tracking-[0.2em]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

            {/* Calendar Days */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-[#EB712B]" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {allCalendarDays.map((cell, idx) => {
                  const cellDate = new Date(cell.year, cell.month, cell.day);
                  const dayRides = rides.filter((ride) => isSameDayCheck(ride.date, cellDate));
                  const isSelected = isSameDayCheck(cellDate, selectedDate);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(cellDate)}
                      className={`
                        aspect-square rounded-2xl p-2 flex flex-col items-center justify-between transition-all duration-300 relative border cursor-pointer outline-none
                        ${isSelected 
                          ? 'bg-[#EB712B] text-white shadow-[0_0_15px_rgba(235,113,43,0.3)] font-bold border-[#EB712B]' 
                          : 'bg-surface hover:bg-hover border-border text-text-main'
                        }
                        ${!cell.isCurrentMonth && !isSelected ? 'opacity-30' : ''}
                      `}
                    >
                      <span className="text-sm font-semibold">{cell.day}</span>
                      
                      {dayRides.length > 0 && (
                        <div className="flex gap-1 justify-center mt-1">
                          {dayRides.map((_, dotIdx) => (
                            <span 
                              key={dotIdx} 
                              className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#EB712B]'}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="bg-surface border border-border p-8 rounded-[32px] shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <CalendarIcon className="text-[#EB712B]" size={20} />
              <div>
                <h3 className="font-black text-sm text-white uppercase tracking-wider">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                  {selectedDateRides.length} Scheduled Ride{selectedDateRides.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {selectedDateRides.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">No rides scheduled on this day</p>
                <button
                  onClick={() => navigate('/dashboard/rides/create')}
                  className="text-xs text-[#EB712B] font-bold hover:underline cursor-pointer"
                >
                  + Create a new ride
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateRides.map((ride) => (
                  <div 
                    key={ride.id}
                    onClick={() => navigate(`/view/userside/dashboard/ride/${ride.id}`)}
                    className="p-4 bg-hover rounded-2xl border border-border hover:border-[#EB712B]/40 transition-all cursor-pointer space-y-2 group"
                  >
                    <h4 className="font-bold text-sm text-white group-hover:text-[#EB712B] transition-colors">{ride.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-text-muted font-medium">
                      <span className="flex items-center gap-1"><Clock size={12} className="text-[#EB712B]" /> {ride.time}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} className="text-[#EB712B]" /> {ride.location}</span>
                      <span className="flex items-center gap-1"><Users size={12} className="text-[#EB712B]" /> {ride.riders} riders</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
