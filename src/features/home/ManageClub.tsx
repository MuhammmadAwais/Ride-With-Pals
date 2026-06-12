import { Plus, Users, Calendar, MessageSquare, ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const ManageClub = () => {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#111111] text-white p-4 md:p-8 font-sans"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <a href="/dashboard/profile" className="p-2 bg-[#222] rounded-full hover:bg-[#333] transition border border-[#333]">
            <ArrowLeft size={24} />
          </a>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-1">Manage Club</h1>
            <p className="text-gray-400 text-sm">High-performance oversight for your athletic organizations.</p>
          </div>
        </div>
        <button className="bg-[#EB712B] w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-500 transition">
          <Plus size={18} /> Register New Club
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div variants={itemVariants} className="h-300 md:h-100 rounded-3xl bg-gray-800 relative overflow-hidden p-6 md:p-8 flex flex-col justify-end">
            <img src="/Images/MountainImage3.png" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
            <div className="absolute inset-0  from-black/80 to-transparent z-0" />
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div className="flex items-end gap-4">
                <div className="w-16 h-16 rounded-2xl border border-gray-700 overflow-hidden shrink-0">
                  <img src="/Images/GirlImage11.png" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">Track Wolf</h2>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-xs text-gray-300">
                    <span className="flex items-center gap-1"><Users size={12} /> Brooklyn Simmons</span>
                    <span className="flex items-center gap-1"><Users size={12} /> 1,380 Members</span>
                    <span>📍 Denver, CO</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="bg-[#2a2a2a] px-4 py-2 rounded-xl text-xs font-semibold border border-gray-700">Edit</button>
                <button className="bg-[#EB712B] px-4 py-2 rounded-xl text-xs font-semibold">Dashboard</button>
              </div>
            </div>
          </motion.div>

          {/* Sub-Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[ 
              { name: "Cyc Rock Club", active: "3,888 ACTIVE", img: "/Images/PersonImage.png" }, 
              { name: "Apex Peak Club", active: "849 ACTIVE", img: "/Images/MountainIamge2.jpg" } 
            ].map((club, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-[#1a1a1a] rounded-3xl overflow-hidden border border-[#222] cursor-pointer hover:border-gray-600 transition">
                <div className="h-40 relative bg-gray-700">
                  <img src={club.img} alt={club.name} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute top-4 right-4 bg-[#222]/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-blue-400">ACTIVE</div>
                </div>
                <div className="p-5 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{club.name}</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">{club.active}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-[#1a1a1a] rounded-3xl p-6 border border-[#222] h-fit">
          <h3 className="font-bold mb-6">Portfolio Insights</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 mb-8">
            <div className="bg-[#222222] p-4 rounded-2xl">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Active Members</p>
              <p className="text-2xl font-bold">4,822</p>
            </div>
            <div className="bg-[#222222] p-4 rounded-2xl">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Global Rank</p>
              <p className="text-xl font-bold text-[#EB712B]">#42</p>
            </div>
          </div>
          
          <button className="w-full py-3 border border-[#333] rounded-xl text-[10px] font-bold text-gray-400 mb-6 hover:bg-[#2a2a2a]">
            FULL ANALYTICS REPORT
          </button>

          <div className="space-y-3">
            {[ 
              { icon: Calendar, label: "Event Calendar" }, 
              { icon: MessageSquare, label: "Communication" }, 
              { icon: ShieldCheck, label: "Verification" } 
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#222222] rounded-xl cursor-pointer hover:bg-[#2a2a2a] transition">
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="text-gray-400" />
                  <p className="text-sm font-bold">{item.label}</p>
                </div>
                <ChevronRight size={16} className="text-gray-600" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ManageClub;