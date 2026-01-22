import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit, Tag, X, Loader2 } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [submitting, setSubmitting] = useState(false);

  // Colors for UI selection
  const colors = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-100 text-blue-600' },
    { name: 'Green', value: 'green', class: 'bg-green-100 text-green-600' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-100 text-purple-600' },
    { name: 'Red', value: 'red', class: 'bg-red-100 text-red-600' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-100 text-orange-600' },
  ];

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // Open Modal
  const handleAddNew = () => {
    setEditingCategory(null);
    setName('');
    setColor('blue');
    setShowModal(true);
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color);
    setShowModal(true);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, { name, color });
        toast.success("Category Updated!");
      } else {
        await api.post('/admin/categories', { name, color });
        toast.success("Category Created!");
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c._id !== id));
      toast.success("Deleted");
    } catch (error) {
      toast.error("Error deleting");
    }
  };

  // Helper to get color class
  const getColorClass = (colorName) => {
    return colors.find(c => c.value === colorName)?.class || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
            <p className="text-gray-500 mt-1">Organize your audio tracks</p>
          </div>
          <button onClick={handleAddNew} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 font-medium">
            <Plus size={20} /> Add Category
          </button>
        </div>

        {/* List */}
        {loading ? <div className="text-center p-10">Loading...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <div key={cat._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${getColorClass(cat.color)}`}>
                    <Tag size={24} />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{cat.name}</h3>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEdit(cat)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(cat._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowModal(false)}><X className="text-gray-400 hover:text-red-500" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g. Meditation"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color Tag</label>
                <div className="flex gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition
                        ${color === c.value ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}
                        ${c.class}
                      `}
                    >
                      {color === c.value && <div className="w-2 h-2 bg-current rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>

              <button disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex justify-center">
                {submitting ? <Loader2 className="animate-spin" /> : "Save Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;