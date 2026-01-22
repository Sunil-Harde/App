import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api';
import { toast } from 'react-toastify';
import { 
  Plus, 
  CheckCircle, 
  Circle, 
  Trash2, 
  Calendar, 
  Clock, 
  Edit2, 
  Save, 
  X 
} from 'lucide-react'; // Added Edit/Save/Cancel icons

const Goals = () => {
  const [goals, setGoals] = useState([]);
  
  // Create Form State
  const [newGoal, setNewGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Edit Mode State
  const [editingId, setEditingId] = useState(null); // Which goal is being edited?
  const [editData, setEditData] = useState({ title: '', deadline: '', targetDate: '' });

  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/goals');
      setGoals(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchGoals(); }, []);

  // --- ACTIONS ---

  // 1. Create
  const addGoal = async (e) => {
    e.preventDefault();
    if (!newGoal || !deadline) return toast.error("Title and Deadline required");

    try {
      await api.post('/goals', { title: newGoal, deadline, targetDate: targetDate || deadline });
      setNewGoal(''); setDeadline(''); setTargetDate('');
      toast.success("Goal Added");
      fetchGoals();
    } catch (error) { toast.error("Failed to add"); }
  };

  // 2. Delete
  const deleteGoal = async (id) => {
    if(!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await api.delete(`/goals/${id}`);
      setGoals(goals.filter(g => g._id !== id));
      toast.success("Goal Deleted");
    } catch (err) { toast.error("Error deleting"); }
  };

  // 3. Toggle Status (Active/Completed)
  const toggleStatus = async (goal) => {
    try {
      // Send the OPPOSITE status
      const newStatus = goal.status === 'Active' ? 'Completed' : 'Active';
      await api.put(`/goals/${goal._id}`, { status: newStatus });
      fetchGoals();
    } catch (err) { toast.error("Error updating status"); }
  };

  // 4. Enable Edit Mode
  const startEditing = (goal) => {
    setEditingId(goal._id);
    // Format dates for the input field (yyyy-MM-ddThh:mm)
    const formatForInput = (dateStr) => dateStr ? new Date(dateStr).toISOString().slice(0, 16) : '';
    
    setEditData({
      title: goal.title,
      deadline: formatForInput(goal.deadline),
      targetDate: formatForInput(goal.targetDate)
    });
  };

  // 5. Save Edits
  const saveEdit = async (id) => {
    try {
      await api.put(`/goals/${id}`, editData); // Send updated fields
      setEditingId(null); // Exit edit mode
      toast.success("Goal Updated!");
      fetchGoals();
    } catch (err) { toast.error("Update failed"); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Vision Board</h1>

        {/* --- CREATE FORM --- */}
        <form onSubmit={addGoal} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 space-y-4">
          <input 
            type="text" 
            placeholder="What is your main goal?" 
            className="w-full border p-3 rounded-lg outline-none focus:border-blue-500"
            value={newGoal}
            onChange={e => setNewGoal(e.target.value)}
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-bold ml-1">DEADLINE</label>
              <input type="datetime-local" className="w-full border p-3 rounded-lg outline-none text-gray-600" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-bold ml-1">TARGET DATE</label>
              <input type="datetime-local" className="w-full border p-3 rounded-lg outline-none text-gray-600" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
            <Plus size={20} /> Set Goal
          </button>
        </form>

        {/* --- GOALS LIST --- */}
        <div className="space-y-4">
          {goals.map(goal => (
            <div key={goal._id} className={`bg-white p-5 rounded-xl border transition-all ${goal.status === 'Completed' ? 'border-green-200 bg-green-50 opacity-80' : 'border-gray-100'}`}>
              
              {/* CHECK IF EDITING THIS GOAL */}
              {editingId === goal._id ? (
                // --- EDIT MODE UI ---
                <div className="space-y-3">
                  <input 
                    className="w-full border p-2 rounded" 
                    value={editData.title} 
                    onChange={e => setEditData({...editData, title: e.target.value})} 
                  />
                  <div className="flex gap-2">
                    <input type="datetime-local" className="border p-2 rounded flex-1" value={editData.deadline} onChange={e => setEditData({...editData, deadline: e.target.value})} />
                    <input type="datetime-local" className="border p-2 rounded flex-1" value={editData.targetDate} onChange={e => setEditData({...editData, targetDate: e.target.value})} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="text-gray-500 px-3 py-1 flex items-center gap-1 hover:bg-gray-100 rounded">
                      <X size={16} /> Cancel
                    </button>
                    <button onClick={() => saveEdit(goal._id)} className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-blue-700">
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // --- VIEW MODE UI ---
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Toggle Button */}
                    <button onClick={() => toggleStatus(goal)} className={goal.status === 'Completed' ? "text-green-600" : "text-gray-300 hover:text-blue-500"}>
                      {goal.status === 'Completed' ? <CheckCircle size={24} /> : <Circle size={24} />}
                    </button>
                    
                    <div>
                      <h3 className={`text-lg font-bold ${goal.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {goal.title}
                      </h3>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1 text-red-500 font-medium">
                          <Clock size={12} /> Due: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                        {goal.targetDate && (
                          <span className="flex items-center gap-1 text-blue-500">
                            <Calendar size={12} /> Plan: {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => startEditing(goal)} 
                      className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition"
                      title="Edit Details"
                    >
                      <Edit2 size={18} />
                    </button>
                    
                    <button 
                      onClick={() => deleteGoal(goal._id)} 
                      className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"
                      title="Delete Goal"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Goals;