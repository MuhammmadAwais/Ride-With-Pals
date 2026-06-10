import { Plus, Search, Calendar, MapPin, Bike, Bookmark, MoreVertical, } from 'lucide-react';

export default function Activities() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rides</h1>
        <button className="bg-[#EB712B] p-2 rounded-full hover:bg-[#d66526] transition-colors"><Plus /></button>
      </div>

      {/* Tabs */}
      <div className="bg-[#161616] p-1 rounded-2xl flex mb-6 border border-white/5">
        <button className="flex-1 bg-[#EB712B] py-2.5 rounded-xl font-medium text-sm">Active Rides</button>
        <button className="flex-1 text-gray-400 py-2.5 rounded-xl font-medium text-sm hover:text-white transition-colors">Completed Rides</button>
      </div>

      {/* Search */}
      <div className="bg-[#161616] flex items-center px-4 py-3 rounded-2xl border border-white/5 mb-8">
        <Search className="text-gray-500 mr-3" size={20} />
        <input placeholder="Search" className="bg-transparent outline-none w-full text-sm" />
      </div>

      {/* Ride Cards */}
      <div className="space-y-4">
        <RideCard 
          title="Mountain Ride" 
          type="Gravel" 
          distance="80km" 
          participants="10" 
          pace="28km/h" 
        />
        <RideCard 
          title="Mountain Ride" 
          type="Asphalt" 
          distance="80km" 
          participants="10" 
          pace="28km/h" 
          isFemaleOnly={true}
        />
      </div>
    </div>
  );
}

function RideCard({ title, type, distance, participants, pace, isFemaleOnly }: any) {
  return (
    <div className="bg-[#161616] p-6 rounded-3xl border border-blue-500/30 shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-xl">{title}</h3>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Calendar size={14} /> 20 Jan, 2026 - 10:00 AM</span>
            <span className="flex items-center gap-1"><MapPin size={14} /> 6391 Elgin St. Celina, Delaware 10299</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#1e1e1e] px-3 py-1 rounded-lg text-orange-500 text-xs font-bold border border-white/5">GPX</span>
          <Bookmark size={20} className="text-gray-500 cursor-pointer" />
          <MoreVertical size={20} className="text-gray-500 cursor-pointer" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <div className="text-sm text-gray-300 flex items-center gap-2">
          <Bike size={16} /> Running Type: <span className="font-bold">{type}</span>
          {isFemaleOnly && <span className="ml-2 text-orange-500 text-xs font-bold px-2 py-0.5 border border-orange-500/20 rounded-full">Female Ride Only</span>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <StatItem value={pace} label="Pace" />
        <StatItem value={distance} label="Distance" />
        <StatItem value={participants} label="Participants" />
      </div>
    </div>
  );
}

function StatItem({ value, label }: any) {
  return (
    <div className="bg-[#1e1e1e] p-4 rounded-2xl text-center border border-white/5">
      <p className="font-black text-lg">{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}