import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Music,
  Users,
  LogOut,
  Tag,
  Target,     // <--- Icon for Goals
  BookOpen,   // <--- Icon for Journals
  User,        // <--- Icon for Profile
  PlayCircle
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Clear all potential user data
    localStorage.removeItem('userInfo');
    localStorage.removeItem('adminToken'); // if you used this name previously
    localStorage.removeItem('adminName');  // if you used this name previously
    navigate('/');
  };

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path
    ? "bg-slate-700 text-blue-400 border-l-4 border-blue-400"
    : "hover:bg-slate-700 hover:text-white text-slate-300";

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 shadow-xl z-50">

      {/* Logo Area */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-center tracking-wider text-white">
          Miracle<span className="text-blue-500">Admin</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-2">

        <Link to="/dashboard" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/dashboard')}`}>
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </Link>

        {/* --- CONTENT MANAGEMENT --- */}
        <div className="px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Content</div>

        <Link to="/categories" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/categories')}`}>
          <Tag size={20} />
          <span className="font-medium">Categories</span>
        </Link>

        <Link to="/add-audio" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/add-audio')}`}>
          <Music size={20} />
          <span className="font-medium">Audio Library</span>
        </Link>

        <Link to="/videos" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive('/videos')}`}>
          <div className="bg-red-500/10 p-1 rounded text-red-500">
            <PlayCircle size={18} />
          </div>
          <span className="font-medium">Video Library</span>
        </Link>

        <Link to="/users" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/users')}`}>
          <Users size={20} />
          <span className="font-medium">Users List</span>
        </Link>

        {/* --- PERSONAL TOOLS --- */}
        <div className="px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">Personal</div>

        <Link to="/goals" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/goals')}`}>
          <Target size={20} />
          <span className="font-medium">My Goals</span>
        </Link>

        <Link to="/journals" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/journals')}`}>
          <BookOpen size={20} />
          <span className="font-medium">My Journal</span>
        </Link>

        <Link to="/profile" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/profile')}`}>
          <User size={20} />
          <span className="font-medium">Profile Settings</span>
        </Link>




      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-semibold"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;