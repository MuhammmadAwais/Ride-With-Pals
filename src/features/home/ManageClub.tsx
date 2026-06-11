import { BarChart3, Users, Calendar, MessageSquare, ShieldCheck, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageClub = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#121212] min-h-screen p-8 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        
       <button 
  onClick={() => navigate('/dashboard/profile')} 
  className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#EB712B] mb-6 transition-colors group"
>
  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
  <span className="font-medium">Back to Profile</span>
</button>
        {/* Top Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Club</h1>
            <p className="text-[#a0a0a0]">Oversee your athletic organizations, monitor member activity, and manage <br/> elite performance metrics across all your registered clubs.</p>
          </div>
          <button className="bg-[#EB712B] flex items-center gap-2 px-6 py-3 rounded-xl font-bold hover:bg-[#c95f1f] transition">
            <Plus size={20} /> Create New Club
          </button>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Large Hero Card */}
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-[#333] p-6 flex flex-col justify-end">
            <img src="/Images/PersonImage.png" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 from-black/80 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-white/20 overflow-hidden">
                  <img src="/Images/GirlImage11.png" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Track Wolf</h2>
                  <p className="text-sm text-gray-300">Brooklyn Simmons • 1,240 members</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="bg-[#333] px-6 py-2 rounded-lg font-bold hover:bg-[#444]">Edit Details</button>
                <button className="bg-[#EB712B] px-6 py-2 rounded-lg font-bold hover:bg-[#c95f1f]">Manage</button>
              </div>
            </div>
          </div>

          {/* Sidebar Insights */}
          <div className="bg-[#1e1e1e] p-6 rounded-3xl border border-[#333]">
            <BarChart3 className="text-[#EB712B] mb-4" />
            <h3 className="text-xl font-bold mb-2">Club Insights</h3>
            <p className="text-[#a0a0a0] text-sm mb-6">Performance metrics are up 14% across all registered clubs this month.</p>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between bg-[#121212] p-3 rounded-lg border border-[#333]"><span>Active Members</span><span className="font-bold">4,822</span></div>
              <div className="flex justify-between bg-[#121212] p-3 rounded-lg border border-[#333]"><span>Global Rank</span><span className="font-bold">#42</span></div>
            </div>
            <button className="w-full py-3 border border-[#333] rounded-lg hover:bg-[#333] transition">View All Reports</button>
          </div>
        </div>

        {/* Secondary Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="relative h-64 rounded-3xl overflow-hidden border border-[#333] p-6 flex flex-col justify-end group cursor-pointer">
              <img src={i === 1 ? "/Images/cycleImage7.png" : "/Images/MountainImage.png"} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0  from-black/80 to-transparent"></div>
              <div className="relative flex justify-between items-end">
                <div>
                  <div className="bg-[#1a3a2a] text-[#4ade80] text-xs px-2 py-1 rounded w-fit mb-2">NEW ACTIVITY</div>
                  <h3 className="text-xl font-bold">Cyc Rock Club</h3>
                  <p className="text-sm text-gray-300 flex items-center gap-1"><Users size={14}/> 1000 members</p>
                </div>
                <div className="bg-white/10 p-3 rounded-full group-hover:bg-[#EB712B] transition"><ArrowRight size={20}/></div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1e1e1e] p-6 rounded-2xl flex items-center gap-4 border border-[#333]"><Calendar className="text-[#EB712B]" /><div><p className="font-bold">Event Calendar</p><p className="text-sm text-[#a0a0a0]">4 events this week</p></div></div>
          <div className="bg-[#1e1e1e] p-6 rounded-2xl flex items-center gap-4 border border-[#333]"><MessageSquare className="text-[#EB712B]" /><div><p className="font-bold">Member Feed</p><p className="text-sm text-[#a0a0a0]">12 new messages</p></div></div>
          <div className="bg-[#1e1e1e] p-6 rounded-2xl flex items-center gap-4 border border-[#333]"><ShieldCheck className="text-[#EB712B]" /><div><p className="font-bold">Verification</p><p className="text-sm text-[#a0a0a0]">Pending reviews: 3</p></div></div>
        </div>
      </div>
    </div>
  );
};

export default ManageClub;