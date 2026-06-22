import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Car,
  Wallet,
  UserCircle,
  Newspaper,
  Trophy,
  Percent,
  UserPlus,
  Settings,
  X,
  Compass,
  Bike,
  TicketPercent,
  MessageSquare,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const isCommunitySide =
    location.pathname.startsWith("/clubs") ||
    location.pathname.startsWith("/my-promos") ||
    location.pathname.startsWith("/dashboard/ride") ||
    location.pathname.startsWith("/support/athlete");

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
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between mb-10 px-2 shrink-0">
          <img src="/Images/Logo.png" alt="Logo" className="h-12 w-auto" />
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col space-y-2 overflow-y-auto">
          {isCommunitySide ? (
            <>
              <div className="px-3 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Athlete Interface
              </div>
              <NavItem
                onClick={() => {
                  navigate("/clubs");
                  onClose();
                }}
                active={isActive("/clubs")}
                label="Explore Clubs"
                icon={<Compass size={20} />}
              />
              <NavItem
                onClick={() => {
                  navigate("/clubs/Ride");
                  onClose();
                }}
                active={isActive("/clubs/Ride")}
                label="Ride"
                icon={<Bike size={20} />}
              />
              <NavItem
                onClick={() => {
                  navigate("/my-promos");
                  onClose();
                }}
                active={isActive("/my-promos")}
                label="Discount"
                icon={<TicketPercent size={20} />}
              />
              <NavItem
                onClick={() => {
                  navigate("/support/athlete");
                  onClose();
                }}
                active={isActive("/support/athlete")}
                label="Chat Support"
                icon={<MessageSquare size={20} />}
              />{" "}
            </>
          ) : (
            <>
              <div className="px-3 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Club Management
              </div>
              <NavItem
                onClick={() => {
                  navigate("/dashboard");
                  onClose();
                }}
                active={isActive("/dashboard")}
                label="Dashboard"
                icon={<LayoutDashboard size={20} />}
              />
              <NavItem
                onClick={() => {
                  navigate("/activities");
                  onClose();
                }}
                active={isActive("/activities")}
                label="Activities"
                icon={<Users size={20} />}
              />
              <NavItem
                onClick={() => {
                  navigate("/product");
                  onClose();
                }}
                active={isActive("/product")}
                label="Product"
                icon={<Car size={20} />}
              />
              <NavItem
                onClick={() => {
                  navigate("/order");
                  onClose();
                }}
                active={isActive("/order")}
                label="Order"
                icon={<Wallet size={20} />}
              />
              <NavItem
                onClick={() => {
                  navigate("/news");
                  onClose();
                }}
                active={isActive("/news")}
                label="News"
                icon={<Newspaper size={20} />}
              />
              <NavItem
                onClick={() => {
                  navigate("/leader-board");
                  onClose();
                }}
                active={isActive("/leader-board")}
                label="Leaderboard"
                icon={<Trophy size={20} />}
              />
              <NavItem
                onClick={() => {
                  navigate("/discount");
                  onClose();
                }}
                active={isActive("/discount")}
                label="Discount"
                icon={<Percent size={20} />}
              />
              <NavItem
                onClick={() => {
                  navigate("/joining-requests");
                  onClose();
                }}
                active={isActive("/joining-requests")}
                label="Joining Requests"
                icon={<UserPlus size={20} />}
              />
              <NavItem
                onClick={() => {
                  navigate("/profile");
                  onClose();
                }}
                active={isActive("/profile")}
                label="Profile"
                icon={<UserCircle size={20} />}
              />
            </>
          )}

          <div className="mt-auto pt-4 border-t border-white/5">
            <NavItem label="Settings" icon={<Settings size={20} />} />
          </div>
        </nav>
      </aside>
    </>
  );
};

function NavItem({
  icon,
  label,
  active,
  activeSub,
  onClick,
}: {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  activeSub?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 cursor-pointer px-4 py-3 rounded-xl transition-all font-medium ${
        active || activeSub
          ? "bg-[#eb712a] text-white"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

export default Sidebar;
