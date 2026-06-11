import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Car, Wallet, UserCircle, 
  Newspaper, Trophy, Percent, UserPlus, Settings 
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check if the current path matches the nav item
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-72 h-full bg-[#111111] border-r border-white/10 p-6 flex flex-col shrink-0">
      <div className="flex items-center mb-10 px-2 shrink-0">
        <img src="/Images/Logo.png" alt="Logo" className="h-12 w-auto" />
      </div>

      <nav className="flex-1 flex flex-col space-y-2 overflow-y-auto">
        <NavItem 
          onClick={() => navigate('/dashboard')} 
          active={isActive('/dashboard')} 
          label="Dashboard" 
          icon={<LayoutDashboard size={20} />} 
        />
        <NavItem 
          onClick={() => navigate('/dashboard/activities')} 
          active={isActive('/dashboard/activities')} 
          label="Activities" 
          icon={<Users size={20} />} 
        />
        <NavItem 
          onClick={() => navigate('/dashboard/product')} 
          active={isActive('/dashboard/product')} 
          label="Product" 
          icon={<Car size={20} />} 
        />
        <NavItem label="Order" icon={<Wallet size={20} />} />
        <NavItem 
          onClick={() => navigate('/dashboard/profile')} 
          active={isActive('/dashboard/profile')} 
          label="Profile" 
          icon={<UserCircle size={20} />} 
        />
        
        <div className="my-4 border-t border-white/10" />
        
        <NavItem label="News" icon={<Newspaper size={20} />} />
        <NavItem label="Leaderboard" icon={<Trophy size={20} />} />
        <NavItem label="Discount" icon={<Percent size={20} />} />
        <NavItem label="Club Joining Request" icon={<UserPlus size={20} />} />
        
        <div className="mt-auto pt-4">
          <NavItem label="Settings" icon={<Settings size={20} />} />
        </div>
      </nav>
    </aside>
  );
};

// Helper Component
function NavItem({ icon, label, active, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-4 cursor-pointer px-4 py-3 rounded-xl transition-all font-medium ${
        active ? 'bg-[#eb712a] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

export default Sidebar;