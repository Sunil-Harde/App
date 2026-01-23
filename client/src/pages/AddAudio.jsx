import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api';
import { toast } from 'react-toastify';
import { Plus, Loader2, X, UploadCloud, Music, Image as ImageIcon } from 'lucide-react';
import AudioCard from '../components/Audio/AudioCard';

const AddAudio = () => {
  const [audios, setAudios] = useState([]);
  const [categories, setCategories] = useState([]); // <--- 1. NEW STATE FOR CATEGORIES
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAudio, setEditingAudio] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ title: '', category: '', duration: '' });
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Helper: Time Format
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // --- 1. FETCH DATA (Audios & Categories) ---
  const fetchData = async () => {
    try {
      const [audioRes, catRes] = await Promise.all([
        api.get('/audios'),
        api.get('/categories')
      ]);

      setAudios(audioRes.data);
      setCategories(catRes.data); // <--- Store Categories

    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. HANDLE AUDIO SELECT (Auto Duration) ---
  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        const durationStr = formatTime(audio.duration);
        setFormData((prev) => ({ ...prev, duration: durationStr }));
        toast.info(`Duration detected: ${durationStr}`);
      };
    }
  };

  // --- 3. OPEN MODALS ---
  const handleAddNew = () => {
    setEditingAudio(null);
    // Default to the first category if available, otherwise empty string
    const defaultCat = categories.length > 0 ? categories[0].name : '';
    setFormData({ title: '', category: defaultCat, duration: '' });
    setImageFile(null);
    setAudioFile(null);
    setShowModal(true);
  };

  const handleEdit = (audio) => {
    setEditingAudio(audio);
    setFormData({
      title: audio.title,
      category: audio.category,
      duration: audio.duration
    });
    setImageFile(null);
    setAudioFile(null);
    setShowModal(true);
  };

  // --- 4. SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const uploadConfig = { headers: { 'Content-Type': 'multipart/form-data' } };
      let imageUrl = editingAudio?.imageUrl;
      let audioUrl = editingAudio?.audioUrl;

      if (imageFile) {
        const imgData = new FormData(); imgData.append('image', imageFile);
        const res = await api.post('/upload', imgData, uploadConfig);
        imageUrl = res.data;
      }

      if (audioFile) {
        const audData = new FormData(); audData.append('image', audioFile);
        const res = await api.post('/upload', audData, uploadConfig);
        audioUrl = res.data;
      }

      const payload = { ...formData, imageUrl, audioUrl };

      // Ensure a category is selected
      if (!payload.category && categories.length > 0) {
        payload.category = categories[0].name;
      }

      if (editingAudio) {
        await api.put(`/audios/${editingAudio._id}`, payload);
        toast.success("Audio Updated!");
      } else {
        if (!imageFile || !audioFile) {
          toast.error("Please upload both files");
          setSubmitting(false); return;
        }
        await api.post('/admin/audios', payload);
        toast.success("Audio Created!");
      }

      setShowModal(false);
      fetchData(); // Refresh list
    } catch (error) {
      toast.error("Failed to save audio");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this audio?")) return;
    try {
      await api.delete(`/amin/audios/${id}`);
      setAudios(audios.filter(a => a._id !== id));
      toast.success("Deleted");
    } catch (error) { toast.error("Error deleting"); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Audio Library</h1>
          <button onClick={handleAddNew} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 font-medium">
            <Plus size={20} /> Add New
          </button>
        </div>

        {loading ? <div className="text-center p-10">Loading...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audios.map(audio => (
              <AudioCard
                key={audio._id}
                audio={audio}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{editingAudio ? 'Edit Audio' : 'Upload New Audio'}</h2>
              <button onClick={() => setShowModal(false)}><X className="text-gray-400 hover:text-red-500" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                {/* --- 2. DYNAMIC CATEGORY DROPDOWN --- */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full border border-gray-300 p-2 rounded-lg bg-white"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No categories found</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Auto)</label>
                  <input
                    className="w-full border border-gray-200 bg-gray-100 p-2 rounded-lg text-gray-500 cursor-not-allowed"
                    value={formData.duration}
                    readOnly
                    placeholder="Select audio..."
                  />
                </div>
              </div>

              {/* ... Image & Audio Upload sections remain the same ... */}
              <div className="border border-dashed border-gray-300 rounded-lg p-4 relative hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  {editingAudio && !imageFile ? (
                    <img
                      src={`http://localhost:5000${editingAudio.imageUrl}`}
                      className="w-16 h-16 rounded object-cover border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-50 rounded flex items-center justify-center text-blue-500">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{imageFile ? imageFile.name : "Thumbnail Image"}</p>
                    <input type="file" accept="image/*" className="text-xs mt-1" onChange={e => setImageFile(e.target.files[0])} />
                  </div>
                </div>
              </div>

              <div className="border border-dashed border-gray-300 rounded-lg p-4 relative hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-50 rounded flex items-center justify-center text-green-500"><Music size={24} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{audioFile ? audioFile.name : "Audio File (MP3)"}</p>
                    <input type="file" accept="audio/*" className="text-xs mt-1" onChange={handleAudioSelect} />
                  </div>
                </div>
              </div>

              <button disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition shadow-lg flex justify-center">
                {submitting ? <Loader2 className="animate-spin" /> : (editingAudio ? "Update Audio" : "Publish Audio")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAudio;