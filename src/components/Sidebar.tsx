import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Car, Wallet, UserCircle, 
  Newspaper, Trophy, Percent, UserPlus, Settings, X 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Sidebar Overlay (Mobile Only) */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" 
        />
      )}

     
      <aside 
        className={`
          fixed lg:relative z-50 w-72 h-screen bg-[#111111] border-r border-white/10 p-6 flex flex-col shrink-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between mb-10 px-2 shrink-0">
          <img src="/Images/Logo.png" alt="Logo" className="h-12 w-auto" />
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        {/* Navigation - flex-1 allows this to fill space, overflow-y-auto enables scrolling if list gets long */}
        <nav className="flex-1 flex flex-col space-y-2 overflow-y-auto">
          <NavItem onClick={() => { navigate('/dashboard'); onClose(); }} active={isActive('/dashboard')} label="Dashboard" icon={<LayoutDashboard size={20} />} />
          <NavItem onClick={() => { navigate('/dashboard/activities'); onClose(); }} active={isActive('/dashboard/activities')} label="Activities" icon={<Users size={20} />} />
          <NavItem onClick={() => { navigate('/dashboard/product'); onClose(); }} active={isActive('/dashboard/product')} label="Product" icon={<Car size={20} />} />
          <NavItem onClick={() => { navigate('/dashboard/order'); onClose(); }} active={isActive('/dashboard/order')} label="Order" icon={<Wallet size={20} />} />
          
          
        
          
          <NavItem onClick={() => { navigate('/dashboard/News'); onClose(); }} active={isActive('/dashboard/News')} label="News" icon={<Newspaper size={20} />} />
          <NavItem onClick={() => { navigate('/dashboard/leader-board'); onClose(); }} active={isActive('/dashboard/leader-board')} label="Leaderboard" icon={<Trophy size={20} />} />
          <NavItem onClick={() => { navigate('/dashboard/discount'); onClose(); }} active={isActive('/dashboard/discount')} label="Discount" icon={<Percent size={20} />} />
          <NavItem onClick={() => { navigate('/dashboard/joining-requests'); onClose(); }} active={isActive('/dashboard/joining-requests')} label="Joining Requests" icon={<UserPlus size={20} />} />
          
          <div className="mt-auto pt-4">
            <NavItem onClick={() => { navigate('/dashboard/profile'); onClose(); }} active={isActive('/dashboard/profile')} label="Profile" icon={<UserCircle size={20} />} />
            <NavItem label="Settings" icon={<Settings size={20} />} />
          </div>
        </nav>
      </aside>
    </>
  );
};

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
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