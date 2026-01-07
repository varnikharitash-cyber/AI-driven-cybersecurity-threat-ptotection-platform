import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  Activity,
  Network,
  Globe,
  MessageSquare,
  BarChart3,
  FileCode,
  ShieldAlert,
  LogOut,
  User,
  ChevronUp
} from 'lucide-react';

import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
     await signOut();
     navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileSearch, label: 'File Analysis', path: '/analysis' },
    { icon: Activity, label: 'Streaming', path: '/streaming' },
    { icon: Network, label: 'Network Security', path: '/network' },
    { icon: Globe, label: 'Attack Map', path: '/map' },
    { icon: MessageSquare, label: 'SIMBA AI', path: '/ai' },
    { icon: BarChart3, label: 'Analytics', path: '/stats' },
    { icon: FileCode, label: 'PCAP Analysis', path: '/pcap' },
    { icon: ShieldAlert, label: 'Live Monitor', path: '/monitor' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 h-[100dvh] flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto glass-morphism p-4 ${isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center gap-3 mb-10 px-2 justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-cyber-blue rounded-lg flex items-center justify-center shadow-neon-blue">
            <ShieldAlert className="text-cyber-black" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-cyber-blue">CYBER<span className="text-white">SPY</span></h1>
          </div>
           <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

      <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                ? 'bg-cyber-blue/10 border border-cyber-blue/50 text-cyber-blue shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="mt-auto relative">
         {showProfileMenu && (
            <div className="absolute bottom-full left-0 w-full mb-2 p-3 glass-morphism rounded-xl border border-white/10 shadow-lg animate-in slide-in-from-bottom-2 fade-in">
               <div className="text-sm font-bold text-white mb-1 truncate">{user?.email || 'Agent'}</div>
               <div className="text-xs text-gray-400 mb-3 truncate">Level 5 Clearance</div>
               <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-xs font-bold uppercase"
               >
                  <LogOut size={14} /> Sign Out
               </button>
            </div>
         )}
         
         <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full p-3 glass-morphism rounded-2xl border-cyber-blue border-opacity-20 flex items-center gap-3 hover:bg-white/5 transition-colors group"
         >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyber-blue to-cyber-purple p-0.5">
               <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <User size={14} className="text-white" />
               </div>
            </div>
            <div className="flex-1 text-left">
               <div className="text-xs font-bold text-white truncate max-w-[100px]">{user?.email?.split('@')[0] || 'User'}</div>
               <div className="text-[10px] text-gray-500">View Profile</div>
            </div>
            <ChevronUp size={16} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
