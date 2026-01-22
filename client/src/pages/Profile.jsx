import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Save, Loader2 } from 'lucide-react';

const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch current user data
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/user/profile');
        setName(data.name);
        setEmail(data.email);
      } catch (error) {
        toast.error("Could not load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/user/profile', {
        name,
        email,
        password: password || undefined, // Only send password if changed
      });
      
      // Update local storage
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success("Profile Updated Successfully");
      setPassword(''); // Clear password field
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h1>

        <div className="max-w-xl bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleUpdate} className="space-y-6">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password (Optional)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current password"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;