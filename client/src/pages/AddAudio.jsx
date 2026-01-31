import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';
import MediaCard from '../components/MediaCard';      
import MediaSkeleton from '../components/MediaSkeleton'; 
import api from '../api';
import { toast } from 'react-toastify';
import { 
  Plus, Loader2, X, UploadCloud, Music, Image as ImageIcon, Headphones
} from 'lucide-react';

const Audios = () => {
  const [audios, setAudios] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewAudio, setViewAudio] = useState(null); // Player Modal
  const [viewImage, setViewImage] = useState(null); // Big Image Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, action: null });
  const [editingAudio, setEditingAudio] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({ title: '', category: '', description: '', duration: '' });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // --- URL HELPER ---
  const getProxyUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `http://localhost:5000${url}`; 
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [audioRes, catRes] = await Promise.all([api.get('/audios'), api.get('/categories')]);
      setAudios(audioRes.data);
      setCategories(catRes.data);
    } catch (error) { toast.error("Failed to load data"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLERS ---
  const formatDuration = (sec) => {
    if (!sec) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('audio/')) return toast.error("Only Audio files allowed (MP3/WAV)");
      setAudioFile(file);
      
      const audioObj = new Audio(URL.createObjectURL(file));
      audioObj.onloadedmetadata = () => {
        const dur = formatDuration(audioObj.duration);
        setFormData(prev => ({ ...prev, duration: dur }));
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      
      let finalImage = editingAudio?.thumbnailUrl || editingAudio?.imageUrl;
      let finalAudio = editingAudio?.audioUrl;

      if (thumbnailFile) {
        const data = new FormData(); data.append('image', thumbnailFile);
        const res = await api.post('/upload', data, config);
        finalImage = res.data;
      }

      if (audioFile) {
        const data = new FormData(); data.append('image', audioFile);
        const res = await api.post('/upload', data, config);
        finalAudio = res.data;
      }

      const payload = { 
        ...formData, 
        thumbnailUrl: finalImage,
        imageUrl: finalImage,
        audioUrl: finalAudio 
      };

      if (!payload.category && categories.length > 0) payload.category = categories[0].name;

      if (editingAudio) {
        await api.put(`/admin/audios/${editingAudio._id}`, payload);
        toast.success("Updated!");
      } else {
        if (!audioFile) throw new Error("Audio file required");
        await api.post('/admin/audios', payload);
        toast.success("Created!");
      }
      setShowFormModal(false);
      fetchData();
    } catch (error) { toast.error("Failed"); } 
    finally { setSubmitting(false); }
  };

  const openAddModal = () => {
    setEditingAudio(null);
    setFormData({ title: '', category: categories[0]?.name || '', description: '', duration: '' });
    setThumbnailFile(null); setAudioFile(null); setShowFormModal(true);
  };

  const openEditModal = (audio) => {
    setEditingAudio(audio);
    setFormData({ title: audio.title, category: audio.category, description: audio.description, duration: audio.duration });
    setThumbnailFile(null);
    setAudioFile(null); 
    setShowFormModal(true);
  };

  const deleteHandler = (id) => {
    setDeleteModal({
      isOpen: true,
      action: async () => {
        try { await api.delete(`/admin/audios/${id}`); setAudios(audios.filter(a => a._id !== id)); toast.success("Deleted"); } 
        catch (error) { toast.error("Failed"); }
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <ConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} onConfirm={deleteModal.action} title="Delete Audio?" isDanger={true} />

      {/* --- BIG IMAGE MODAL --- */}
      {viewImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4 animate-in fade-in cursor-pointer" onClick={() => setViewImage(null)}>
           <img src={getProxyUrl(viewImage)} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain cursor-default" onClick={(e) => e.stopPropagation()}/>
           <button className="absolute top-5 right-5 text-white bg-white/20 p-2 rounded-full hover:bg-white/40 transition"><X size={24}/></button>
        </div>
      )}

      {/* --- AUDIO PLAYER MODAL --- */}
      {viewAudio && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl relative flex flex-col items-center p-8">
            <button onClick={() => setViewAudio(null)} className="absolute top-4 right-4 z-10 p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-red-50 hover:text-red-500 transition cursor-pointer"><X size={24}/></button>
            <div className="w-48 h-48 rounded-full shadow-lg border-4 border-gray-100 relative mb-6 animate-[spin_5s_linear_infinite]">
               {(viewAudio.thumbnailUrl || viewAudio.imageUrl) ? (
                 <img src={getProxyUrl(viewAudio.thumbnailUrl || viewAudio.imageUrl)} className="w-full h-full object-cover rounded-full" onError={(e) => e.target.style.display='none'}/>
               ) : (
                 <div className="w-full h-full bg-purple-100 flex items-center justify-center rounded-full"><Music size={64} className="text-purple-400"/></div>
               )}
               <div className="absolute inset-0 m-auto w-6 h-6 bg-white rounded-full border border-gray-300"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-1">{viewAudio.title}</h3>
            <span className="text-purple-600 text-sm font-bold bg-purple-50 px-3 py-1 rounded-full mb-6">{viewAudio.category}</span>
            <audio src={getProxyUrl(viewAudio.audioUrl)} className="w-full" controls autoPlay />
          </div>
        </div>
      )}

      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          {/* ICON IS PURPLE, BUT TEXT IS DARK */}
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Headphones className="text-purple-600"/> Audio Library</h1>
          
          {/* --- BUTTON CHANGED TO BLUE --- */}
          <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 font-medium transition-colors cursor-pointer">
            <Plus size={20} /> Add New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
          {loading 
            ? [1,2,3,4,5,6].map(i => <MediaSkeleton key={i} />) 
            : audios.map(audio => (
                <MediaCard 
                  key={audio._id} 
                  data={audio} 
                  type="audio" 
                  onPlay={setViewAudio} 
                  onViewImage={setViewImage}
                  onEdit={openEditModal} 
                  onDelete={deleteHandler} 
                />
              ))
          }
        </div>
      </div>

      {/* --- FORM MODAL --- */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{editingAudio ? 'Edit Audio' : 'Upload Audio'}</h2>
              <button onClick={() => setShowFormModal(false)}><X className="text-gray-400 hover:text-red-500 transition cursor-pointer" /></button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                    {/* --- FOCUS RING CHANGED TO BLUE --- */}
                    <input className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition" 
                           value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select className="w-full border p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                      <option value="">Select</option>
                      {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Duration</label>
                    <input className="w-full border bg-gray-50 p-2.5 rounded-lg text-gray-500" value={formData.duration} readOnly />
                  </div>
                </div>

                {/* Upload Box: Kept Purple Theme for identification, but text interaction is blue */}
                <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition ${audioFile ? 'border-green-400 bg-green-50' : 'border-purple-200 bg-purple-50 hover:bg-purple-100'}`}>
                    <Music size={32} className={audioFile ? "text-green-600" : "text-purple-500"}/>
                    <p className="text-sm font-bold mt-2 text-gray-700">{audioFile ? audioFile.name : (editingAudio ? "Keep Current Audio" : "Upload MP3")}</p>
                    <input type="file" accept="audio/*" className="hidden" id="audUpload" onChange={handleAudioSelect} />
                    {/* --- LINK TEXT CHANGED TO BLUE --- */}
                    <label htmlFor="audUpload" className="mt-2 text-xs text-blue-600 underline cursor-pointer hover:text-blue-800">Choose File</label>
                </div>

                <div className="border border-dashed p-3 rounded-lg flex items-center gap-4 hover:bg-gray-50 transition">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center">
                       {thumbnailFile ? (
                         <img src={URL.createObjectURL(thumbnailFile)} className="w-full h-full object-cover"/>
                       ) : (editingAudio?.thumbnailUrl || editingAudio?.imageUrl) ? (
                         <img src={getProxyUrl(editingAudio.thumbnailUrl || editingAudio.imageUrl)} className="w-full h-full object-cover"/>
                       ) : (
                         <ImageIcon className="text-gray-400"/>
                       )}
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-700">Cover Art</p>
                       <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files[0])} className="text-sm mt-1 text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
                    </div>
                </div>

                <div className="col-span-2">
                   <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                   <textarea className="w-full border p-2.5 rounded-lg h-20 outline-none focus:ring-2 focus:ring-blue-500 transition" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>

                {/* --- BUTTON CHANGED TO BLUE --- */}
                <button disabled={submitting} className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition shadow-md cursor-pointer flex justify-center items-center">
                   {submitting ? <Loader2 className="animate-spin"/> : "Save Audio"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audios;