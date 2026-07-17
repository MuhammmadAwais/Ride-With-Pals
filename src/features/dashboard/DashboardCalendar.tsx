import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Users, PlusCircle } from 'lucide-react';

interface Ride {
  id: number;
  title: string;
  date: Date;
  time: string;
  location: string;
  distance: string;
  riders: number;
}

const MOCK_RIDES: Ride[] = [
  {
    id: 1,
    title: 'Misty Pines Dawn Patrol',
    date: new Date(2026, 6, 18), // July 18, 2026
    time: '06:30 AM',
    location: 'Blackwood Trailhead',
    distance: '42 km',
    riders: 14,
  },
  {
    id: 2,
    title: 'Twilight Alpine Gravel Grind',
    date: new Date(2026, 6, 20), // July 20, 2026
    time: '05:45 PM',
    location: 'Schwarzwald Pass',
    distance: '55 km',
    riders: 8,
  },
  {
    id: 3,
    title: 'Sunday Social Cafe Roll',
    date: new Date(2026, 6, 26), // July 26, 2026
    time: '09:00 AM',
    location: 'Stanza Coffee, Munich',
    distance: '30 km',
    riders: 22,
  },
];

export const DashboardCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 6, 17));
  const [rides] = useState<Ride[]>(MOCK_RIDES);

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

  // Days from previous month to fill the first row
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

  // Days of current month
  const currentMonthDaysToRender = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDaysToRender.push({
      day: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
    });
  }

  // Days of next month to fill remaining cells
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
                      aspect-square rounded-2xl p-2 flex flex-col items-center justify-between transition-all duration-300 relative border cursor-pointer border-0 outline-none
                      ${isSelected 
                        ? 'bg-[#EB712B] text-white shadow-[0_0_15px_rgba(235,113,43,0.3)] font-bold' 
                        : 'bg-surface hover:bg-hover border-border text-text-main'
                      }
                      ${!cell.isCurrentMonth && !isSelected ? 'opacity-30' : ''}
                    `}
                  >
                    <span className="text-sm font-semibold">{cell.day}</span>
                    
                    {dayRides.length > 0 && (
                      <div className="flex gap-1 justify-center mt-1">
                        {dayRides.map((_, rIdx) => (
                          <span 
                            key={rIdx} 
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-[#EB712B]'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Rides Detail Sidebar */}
        <div className="bg-surface border border-border p-8 rounded-[32px] shadow-2xl space-y-6">
          <div>
            <h3 className="font-black text-lg text-white">Rides for Today</h3>
            <p className="text-text-muted text-xs mt-1">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {selectedDateRides.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-2xl space-y-2">
                <CalendarIcon className="mx-auto text-text-muted" size={32} />
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">No rides scheduled for this day</p>
              </div>
            ) : (
              selectedDateRides.map((ride) => (
                <div 
                  key={ride.id} 
                  className="bg-main-bg border border-border p-6 rounded-[24px] space-y-4"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#EB712B] tracking-wider">Group Ride</span>
                    <h4 className="font-bold text-sm text-white mt-1">{ride.title}</h4>
                  </div>

                  <div className="space-y-2 text-xs text-text-muted">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-text-muted" />
                      <span>{ride.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-text-muted" />
                      <span className="truncate">{ride.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-text-muted" />
                      <span>{ride.riders} riders attending ({ride.distance})</span>
                    </div>
                  </div>

                  <button className="w-full bg-surface hover:bg-hover border border-border text-text-main font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer border-0 outline-none">
                    View Details & RSVP
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCalendar;
