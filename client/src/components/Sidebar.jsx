import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Music,
  Users,
  LogOut,
  Tag,
  Target,     
  BookOpen,   
  User,        
  PlayCircle
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  // Helper: Unified Active State Logic
  const getLinkClasses = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 mx-3 rounded-xl transition-all duration-300 group font-medium ${
      isActive 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" // Active: Blue & Glowing
        : "text-slate-400 hover:bg-slate-800 hover:text-white"   // Inactive: Grey to White
    }`;
  };

  return (
    <div className="w-65 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 shadow-2xl z-50 border-r border-slate-800">

      {/* --- LOGO AREA --- */}
      <div className="p-8 flex items-center justify-center border-b border-slate-800/50">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-1">
          Miracle<span className="text-blue-500">Admin</span>
        </h1>
      </div>

      {/* --- SCROLLABLE NAV --- */}
      {/* Added 'custom-scrollbar' class for the perfect look */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-2 custom-scrollbar">
        
        <Link to="/dashboard" className={getLinkClasses('/dashboard')}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        {/* SECTION: CONTENT */}
        <div className="px-7 mt-6 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
          Content Library
        </div>

        <Link to="/categories" className={getLinkClasses('/categories')}>
          <Tag size={20} />
          <span>Categories</span>
        </Link>

        <Link to="/add-audio" className={getLinkClasses('/add-audio')}>
          <Music size={20} />
          <span>Audio Library</span>
        </Link>

        {/* ✅ FIXED: Video Link now matches other links perfectly */}
        <Link to="/videos" className={getLinkClasses('/videos')}>
          <PlayCircle size={20} />
          <span>Video Library</span>
        </Link>

        <Link to="/users" className={getLinkClasses('/users')}>
          <Users size={20} />
          <span>Users List</span>
        </Link>

        {/* SECTION: PERSONAL */}
        <div className="px-7 mt-8 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
          Personal
        </div>

        <Link to="/goals" className={getLinkClasses('/goals')}>
          <Target size={20} />
          <span>My Goals</span>
        </Link>

        <Link to="/journals" className={getLinkClasses('/journals')}>
          <BookOpen size={20} />
          <span>My Journal</span>
        </Link>

        <Link to="/profile" className={getLinkClasses('/profile')}>
          <User size={20} />
          <span>Profile Settings</span>
        </Link>

      </nav>

      {/* --- LOGOUT AREA --- */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white py-3 rounded-xl transition-all duration-300 font-bold border border-red-500/20 hover:border-transparent group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Logout
        </button>
      </ div>
    </div>
  );
};

export default Sidebar;