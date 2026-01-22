import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api'; 
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Music, 
  Target, 
  Plus, 
  BookOpen, 
  Sparkles 
} from 'lucide-react'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({
    count1: 0, // Admin: Users | User: Goals
    count2: 0, // Admin: Audios | User: Journals
    count3: 0  // Admin: Goals  | User: Audios Listened (Mock)
  });

  // 1. Check Login
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (!storedUser) {
      navigate('/'); 
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  // 2. Fetch Data based on Role
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        if (user.isAdmin) {
          // --- ADMIN VIEW: Fetch System Stats ---
          const [usersRes, audiosRes] = await Promise.all([
            api.get('/admin/users'),
            api.get('/audios')
          ]);
          
          setStats({
            count1: usersRes.data.length, // Total Users
            count2: audiosRes.data.length, // Total Audios
            count3: 0 // Placeholder
          });

        } else {
          // --- USER VIEW: Fetch Personal Stats ---
          // "How Goal Working": We call /goals to count them
          const [goalsRes, journalsRes] = await Promise.all([
            api.get('/goals'),
            api.get('/journals')
          ]);

          // Filter only 'Active' goals
          const activeGoals = goalsRes.data.filter(g => g.status === 'Active').length;

          setStats({
            count1: activeGoals,          // My Active Goals
            count2: journalsRes.data.length, // My Journal Entries
            count3: 12                    // Mock: Audios Listened
          });
        }

      } catch (error) {
        console.error("Dashboard Load Error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // If loading user, show nothing yet
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {user.isAdmin ? "Admin Dashboard" : "My Progress"}
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back, <span className="font-bold text-blue-600">{user.name}</span> 👋
            </p>
          </div>
          
          {/* Dynamic Action Button */}
          <button 
            onClick={() => navigate(user.isAdmin ? '/add-audio' : '/goals')}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 transition"
          >
            <Plus size={20} /> 
            {user.isAdmin ? "Upload Audio" : "Set New Goal"}
          </button>
        </div>

        {/* --- DYNAMIC STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* CARD 1: Users (Admin) OR Goals (User) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {user.isAdmin ? "Total Users" : "Active Goals"}
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {loading ? "..." : stats.count1}
              </h3>
            </div>
            <div className={`p-3 rounded-full ${user.isAdmin ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
              {user.isAdmin ? <Users size={24} /> : <Target size={24} />}
            </div>
          </div>

          {/* CARD 2: Audios (Admin) OR Journals (User) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {user.isAdmin ? "Total Audios" : "Journal Entries"}
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {loading ? "..." : stats.count2}
              </h3>
            </div>
            <div className={`p-3 rounded-full ${user.isAdmin ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
              {user.isAdmin ? <Music size={24} /> : <BookOpen size={24} />}
            </div>
          </div>

          {/* CARD 3: Placeholder (Admin) OR Streaks (User) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {user.isAdmin ? "System Health" : "Audios Listened"}
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {loading ? "..." : (user.isAdmin ? "100%" : stats.count3)}
              </h3>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-full">
              <Sparkles size={24} />
            </div>
          </div>
        </div>

        {/* --- USER-SPECIFIC SECTION --- */}
        {!user.isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quick Goal Preview */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Your Main Focus</h3>
                <button onClick={() => navigate('/goals')} className="text-blue-600 text-sm hover:underline">View All</button>
              </div>
              
              {stats.count1 > 0 ? (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 flex items-center gap-3">
                  <Target className="text-purple-600" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-purple-900">Keep going!</p>
                    <p className="text-xs text-purple-600">You have {stats.count1} active goals pending.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <p>No goals set yet.</p>
                  <button onClick={() => navigate('/goals')} className="text-blue-600 text-sm font-bold mt-2">Create One +</button>
                </div>
              )}
            </div>

            {/* Quick Motivation */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl shadow-md text-white">
              <h3 className="font-bold text-lg mb-2">Quote of the Day</h3>
              <p className="italic opacity-90 mb-4">"The only way to do great work is to love what you do."</p>
              <div className="flex justify-end">
                <button onClick={() => navigate('/add-audio')} className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-gray-100 transition">
                  Listen to Audio
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard; 