import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal'; // <--- Import New Component
import api from '../api';
import { toast } from 'react-toastify';
import { Trash2, Shield, ShieldCheck, Search } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- MODAL STATE ---
  const [modal, setModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    isDanger: false, 
    action: null 
  });

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- 1. HANDLE DELETE CLICK ---
  const clickDelete = (user) => {
    setModal({
      isOpen: true,
      title: 'Delete User?',
      message: `Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`,
      isDanger: true,
      action: () => confirmDelete(user._id) // Store the function to run later
    });
  };

  // --- 2. HANDLE PROMOTE CLICK ---
  const clickToggleAdmin = (user) => {
    const isPromoting = !user.isAdmin;
    setModal({
      isOpen: true,
      title: isPromoting ? 'Promote to Admin?' : 'Revoke Admin Access?',
      message: isPromoting 
        ? `Are you sure you want to give ${user.name} full control over the system?` 
        : `Are you sure you want to remove ${user.name} from the admin team?`,
      isDanger: !isPromoting, // Red color if removing admin
      action: () => confirmToggle(user)
    });
  };

  // --- ACTUAL API CALLS (Run only when "Yes" is clicked) ---
  
  const confirmDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      toast.success('User deleted successfully');
    } catch (error) { toast.error('Delete failed'); }
  };

  const confirmToggle = async (user) => {
    try {
      const newStatus = !user.isAdmin;
      await api.put(`/admin/users/${user._id}`, { isAdmin: newStatus });
      setUsers(users.map(u => u._id === user._id ? { ...u, isAdmin: newStatus } : u));
      toast.success(newStatus ? "User Promoted!" : "User Demoted.");
    } catch (error) { toast.error('Update failed'); }
  };

  // Filter
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* --- RENDER MODAL HERE --- */}
      <ConfirmModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.action}
        title={modal.title}
        message={modal.message}
        isDanger={modal.isDanger}
      />

      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold text-sm uppercase">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4 text-center">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </td>
                  <td className="p-4 text-center">
                    {user.isAdmin ? (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                        <ShieldCheck size={14} /> Admin
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">User</span>
                    )}
                  </td>
                  <td className="p-4 flex justify-end gap-3">
                    {/* BUTTONS NOW TRIGGER MODAL INSTEAD OF API */}
                    <button 
                      onClick={() => clickToggleAdmin(user)}
                      className={`p-2 rounded-lg transition border ${
                        user.isAdmin 
                          ? " text-red-600 bg-red-200 border-gray-200 hover:text-red-700 hover:bg-red-300" 
                          : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                      }`}
                    >
                      {user.isAdmin ? <ShieldCheck size={18} /> : <Shield size={18} />}
                    </button>
                    
                    <button 
                      onClick={() => clickDelete(user)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;