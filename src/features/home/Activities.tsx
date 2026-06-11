import React, { useState } from 'react';
import { Download, MapPin, Users, Gauge, Route, UserCircle } from 'lucide-react';

// --- Helper Components ---

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  title: string;
}

const MetricCard = ({ icon, value, label, title }: MetricCardProps) => (
  <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center hover:-translate-y-1 hover:bg-[#EB712B]/10 hover:border hover:border-[#EB712B] transition-all cursor-default">
    <div className="text-[#EB712B] mb-2">{icon}</div>
    <p className="text-xl sm:text-2xl font-black">{value} <span className="text-sm font-normal text-gray-400">{label}</span></p>
    <p className="text-gray-500 text-[10px] uppercase font-bold mt-1">{title}</p>
  </div>
);

interface LeaderItemProps {
  name: string;
  handle: string;
  imageSrc: string;
}

const LeaderItem = ({ name, handle, imageSrc }: LeaderItemProps) => (
  <div className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition-all cursor-pointer">
    <img src={imageSrc} alt={name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
    <div>
      <p className="text-sm font-bold">{name}</p>
      <p className="text-[10px] text-gray-500 font-medium">{handle}</p>
    </div>
  </div>
);

interface ParticipantItemProps {
  name: string;
  imageSrc: string;
  id: string;
}

const ParticipantItem = ({ name, imageSrc, id }: ParticipantItemProps) => (
  <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center border border-white/5 hover:border-[#EB712B] transition-all cursor-pointer">
    <img src={imageSrc} alt={name} className="w-10 h-10 rounded-full object-cover mb-2 border border-white/10" />
    <p className="text-[10px] font-bold text-center leading-tight truncate w-full">{name}</p>
    <p className="text-[9px] text-gray-500 text-center truncate w-full">{id}</p>
  </div>
);

// --- Main Component ---

const Activities = () => {
  const [showAll, setShowAll] = useState<boolean>(false);

  const participants = [
    { name: "Arlene McCoy", imageSrc: "/Images/Girlmage2.png" , id:"@Arlenmccoy" },
    { name: "Cody Fisher", imageSrc: "/Images/Girlmage3.png" , id:"@CodyFisher" },
    { name: "Eleanor Pena", imageSrc: "/Images/Girlmage4.png" , id:"@EleanorPena" },
    { name: "User Four", imageSrc: "/Images/Girlmage5.png" , id:"@UserFour" },
    { name: "Arlene McCoy", imageSrc: "/Images/Girlmage6.png" , id:"@Arlenmccoy" },
    { name: "Eleanor Pena", imageSrc: "/Images/Girlmage7.png" , id:"@EleanorPena" },
    { name: "User Five", imageSrc: "/Images/Girlmage8.png" , id:"@UserFive" },
    { name: "Cody Fisher", imageSrc: "/Images/Girlmage9.png" , id:"@CodyFisher" },
  ];

  const displayedParticipants = showAll ? participants : participants.slice(0, 3);

  return (
    <div className="w-full text-white p-4 sm:p-6 bg-[#111111] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Activities</h1>
            <p className="text-gray-400">Manage your group rides and community events</p>
          </div>
          <div className="bg-[#161616] p-1 rounded-2xl flex border border-white/5 w-full sm:w-auto">
            <button className="bg-[#EB712B] px-6 py-2 rounded-xl text-sm font-bold shadow-lg flex-1">Active Rides</button>
            <button className="px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors flex-1">Completed</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Card */}
          <div className="lg:col-span-2 bg-[#161616] rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-colors">
            <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden mb-6">
              <img src="/Images/MapImage.jpg" alt="Mountain Ride Map" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-[#EB712B] px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider">ACTIVE</span>
                <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px] tracking-wider">GRAVEL</span>
              </div>
              <button className="absolute top-4 right-4 bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-white/10 hover:bg-[#EB712B]/20 transition-all">
                <Download size={14} /> DOWNLOAD GPX
              </button>
              <div className="absolute bottom-6 left-6">
                <h2 className="text-3xl sm:text-4xl font-bold mb-1">Mountain Ride</h2>
                <p className="flex items-center gap-1 text-gray-300 text-sm"><MapPin size={16} /> Chamonix, French Alps</p>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <MetricCard icon={<Gauge size={20} />} value="28" label="km/h" title="Pace" />
              <MetricCard icon={<Route size={20} />} value="80" label="km" title="Distance" />
              <MetricCard icon={<UserCircle size={20} />} value="10" label="riders" title="Participants" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#161616] p-5 rounded-3xl border border-white/5 hover:border-[#EB712B] transition-all">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Technical Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center border border-white/5">
                      <Users size={16} className="text-[#EB712B]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium">Slots</p>
                      <p className="text-xs font-bold text-white">12 Available</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center border border-white/5">
                      <Gauge size={16} className="text-[#EB712B]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium">Level</p>
                      <p className="text-xs font-bold text-white">Advanced</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hover:border-l-2 hover:border-[#EB712B] pl-4 transition-all">
                <h4 className="text-[15px] font-bold text-[#EB712B] uppercase mb-2">Ride Description</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Puhågisk bek. Polylig ninade. Postfaktisk. Ar dode beling. Tusol anime. Antet edod trektigt. Hära. Ånån jåvis. Nålyrade sans.</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#161616] p-6 rounded-3xl border border-white/5 hover:border-[#EB712B] transition-all">
              <h3 className="text-[10px] text-gray-500 font-bold mb-4 uppercase tracking-widest">Ride Leaders</h3>
              <div className="space-y-4">
                <LeaderItem name="Arlene McCoy" handle="@ARLENEMCCOY" imageSrc="/Images/Girlmage6.png" />
                <LeaderItem name="Cody Fisher" handle="@CODYFISHER" imageSrc="/Images/Girlmage1.png" />
              </div>
            </div>

            <div className="bg-[#161616] p-6 rounded-3xl border border-white/5 hover:border-[#EB712B] transition-all">
              <div className="flex justify-between mb-4">
                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Participants Joined</h3>
                <span onClick={() => setShowAll(!showAll)} className="text-[10px] text-[#EB712B] font-bold cursor-pointer hover:underline transition-all">
                  {showAll ? 'SHOW LESS' : 'VIEW ALL'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {displayedParticipants.map((p, i) => (
                  <ParticipantItem key={i} name={p.name} imageSrc={p.imageSrc} id={p.id} />
                ))}
                {!showAll && participants.length > 3 && (
                  <div onClick={() => setShowAll(true)} className="bg-white/5 rounded-2xl p-4 flex flex-col justify-center items-center border border-transparent hover:border-[#EB712B]/50 cursor-pointer transition-all">
                    <p className="text-xl font-black">+{participants.length - 3}</p>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">More</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activities;