import { Plus, Search, Calendar, MapPin, Bike, Bookmark, MoreVertical, FileText, Users } from 'lucide-react';

export default function Activities() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rides</h1>
        <button className="bg-[#EB712B] p-2 rounded-full hover:bg-[#d66526] transition-colors"><Plus /></button>
      </div>

      {/* Tabs */}
      <div className="bg-[#161616] p-1 rounded-xl flex mb-6 border border-white/5">
        <button className="flex-1 bg-[#EB712B] py-2 rounded-lg font-bold text-sm">Active Rides</button>
        <button className="flex-1 text-gray-400 py-2 rounded-lg font-bold text-sm hover:text-white transition-colors">Completed Rides</button>
      </div>

      {/* Search */}
      <div className="bg-[#161616] flex items-center px-4 py-3 rounded-xl border border-white/5 mb-8">
        <Search className="text-gray-500 mr-3" size={20} />
        <input placeholder="Search" className="bg-transparent outline-none w-full text-sm placeholder:text-gray-600" />
      </div>

      {/* Ride Cards List */}
      <div className="space-y-4">
        <RideCard 
          title="Mountain Ride" 
          type="Gravel" 
          distance="80km" 
          pace="28km/h" 
          participants="10" 
        />
        <RideCard 
          title="Mountain Ride" 
          type="Asphalt" 
          distance="80km" 
          pace="28km/h" 
          participants="10" 
          femaleOnly={true} 
        />
      </div>
    </div>
  );
}

function RideCard({ title, type, distance, pace, participants, femaleOnly }: any) {
  return (
    <div className="bg-[#161616] p-6 rounded-3xl border border-blue-500/20 shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-xl">{title}</h3>
          <div className="flex flex-col gap-2 mt-3 text-xs text-gray-400">
            <div className="flex items-center gap-2"><Calendar size={14} /> 20 Jan, 2026 - 10:00 AM</div>
            <div className="flex items-center gap-2"><MapPin size={14} /> 6391 Elgin St. Celina, Delaware 10299</div>
            <div className="flex items-center gap-2">
              <Bike size={14} /> Ride Type: <span className="font-bold text-white">{type}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#111] px-2 py-1 rounded-md text-[#EB712B] text-[10px] font-bold border border-white/10">GPX</span>
          <div className="bg-blue-600 p-1.5 rounded-lg"><FileText size={16} /></div>
          <Bookmark size={20} className="text-gray-500" />
          <MoreVertical size={20} className="text-gray-500" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        {femaleOnly && (
          <span className="text-[#EB712B] text-xs font-bold flex items-center gap-1">
             <Users size={14} /> Female Ride Only
          </span>
        )}
        <button className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold ml-auto">Duplicate</button>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatItem value={pace} label="Pace" />
        <StatItem value={distance} label="Distance" />
        <StatItem value={participants} label="Participants" />
      </div>
    </div>
  );
}

function StatItem({ value, label }: any) {
  return (
    <div className="bg-[#111] p-3 rounded-2xl text-center border border-white/5">
      <p className="font-black text-sm">{value}</p>
      <p className="text-[10px] text-gray-500 uppercase mt-0.5">{label}</p>
    </div>
  );
}