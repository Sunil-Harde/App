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
  Sparkles,
  Film 
} from 'lucide-react'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({
    count1: 0, // Admin: Users | User: Goals
    count2: 0, // Admin: Audios | User: Journals
    count3: 0  // Admin: Videos | User: Audios Listened
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (!storedUser) {
      navigate('/'); 
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        if (user.isAdmin) {
          const [usersRes, audiosRes, videosRes] = await Promise.all([
            api.get('/admin/users'),
            api.get('/audios'),
            api.get('/videos')
          ]);
          setStats({
            count1: usersRes.data.length,
            count2: audiosRes.data.length,
            count3: videosRes.data.length
          });
        } else {
          const [goalsRes, journalsRes] = await Promise.all([
            api.get('/goals'),
            api.get('/journals')
          ]);
          const activeGoals = goalsRes.data.filter(g => g.status === 'Active').length;
          setStats({
            count1: activeGoals,
            count2: journalsRes.data.length,
            count3: 12 
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

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {user.isAdmin ? "Admin Dashboard" : "My Progress"}
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back, <span className="font-bold text-blue-600">{user.name}</span> 👋
            </p>
          </div>
          
          <button 
            onClick={() => navigate(user.isAdmin ? '/add-audio' : '/goals')}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 transition"
          >
            <Plus size={20} /> 
            {user.isAdmin ? "Upload Audio" : "Set New Goal"}
          </button>
        </div>

        {/* --- DYNAMIC STATS GRID (NOW CLICKABLE) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* CARD 1: Users (Admin) OR Goals (User) */}
          <div 
            onClick={() => navigate(user.isAdmin ? '/users' : '/goals')} 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                {user.isAdmin ? "Total Users" : "Active Goals"}
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {loading ? "..." : stats.count1}
              </h3>
            </div>
            <div className={`p-3 rounded-full transition-colors ${user.isAdmin ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}>
              {user.isAdmin ? <Users size={24} /> : <Target size={24} />}
            </div>
          </div>

          {/* CARD 2: Audios (Admin) OR Journals (User) */}
          <div 
            onClick={() => navigate(user.isAdmin ? '/add-audio' : '/journals')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-purple-500 transition-colors">
                {user.isAdmin ? "Total Audios" : "Journal Entries"}
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {loading ? "..." : stats.count2}
              </h3>
            </div>
            <div className={`p-3 rounded-full transition-colors ${user.isAdmin ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' : 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'}`}>
              {user.isAdmin ? <Music size={24} /> : <BookOpen size={24} />}
            </div>
          </div>

          {/* CARD 3: Videos (Admin) OR Audios Listened (User) */}
          <div 
            onClick={() => navigate(user.isAdmin ? '/videos' : '/add-audio')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">
                {user.isAdmin ? "Total Videos" : "Audios Listened"}
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {loading ? "..." : stats.count3}
              </h3>
            </div>
            <div className={`p-3 rounded-full transition-colors ${user.isAdmin ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white'}`}>
              {user.isAdmin ? <Film size={24} /> : <Sparkles size={24} />}
            </div>
          </div>
        </div>

        {!user.isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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