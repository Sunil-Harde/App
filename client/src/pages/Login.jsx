import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api'; 
import { toast } from 'react-toastify';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setLoading(true);

    try {
      const { data } = await api.post('/user/login', { email, password });
      
      // --- NEW CHECK: IS USER AN ADMIN? ---
      if (!data.isAdmin) {
        toast.error("⛔ Access Denied: You are not an Admin!");
        setLoading(false); // Stop loading
        return; // STOP HERE! Do not save login, do not redirect.
      }

      // If code reaches here, they ARE an admin
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success(`Welcome back, Admin ${data.name}!`);
      
      navigate('/dashboard'); 

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      const message = error.response?.data?.message || 'Login Failed';
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
            <LogIn size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
          <p className="text-gray-500 text-sm mt-1">Authorized personnel only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="admin@miracle.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition shadow-md flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In to Dashboard"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Not an admin?{' '}
          <Link to="/" className="text-blue-600 hover:underline font-semibold">
            Go to User App
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;