import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';
import MediaCard from '../components/MediaCard';      
import MediaSkeleton from '../components/MediaSkeleton'; 
import api from '../api';
import { toast } from 'react-toastify';
import { 
  Plus, Loader2, X, UploadCloud, Film, Image as ImageIcon 
} from 'lucide-react';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewVideo, setViewVideo] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, action: null });
  const [editingVideo, setEditingVideo] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({ title: '', category: '', description: '', duration: '' });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // --- URL HELPER (Fixes broken images/videos) ---
  const getProxyUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `http://localhost:5000${url}`; 
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [videoRes, catRes] = await Promise.all([api.get('/videos'), api.get('/categories')]);
      setVideos(videoRes.data);
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

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Client-Side Check
      if (!file.type.startsWith('video/')) {
        return toast.error("⛔ Invalid file! Please upload a Video (MP4/MKV).");
      }
      setVideoFile(file);
      
      // Auto Duration Logic
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.src = URL.createObjectURL(file);
      vid.onloadedmetadata = () => {
        window.URL.revokeObjectURL(vid.src);
        const dur = formatDuration(vid.duration);
        setFormData(prev => ({ ...prev, duration: dur }));
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      let thumbnailUrl = editingVideo?.thumbnailUrl;
      let videoUrl = editingVideo?.videoUrl;

      // 1. Upload Thumbnail (Type = Image)
      if (thumbnailFile) {
        const data = new FormData(); data.append('image', thumbnailFile);
        const res = await api.post('/upload?type=image', data, config);
        thumbnailUrl = res.data;
      }

      // 2. Upload Video (Type = Video)
      if (videoFile) {
        const data = new FormData(); data.append('image', videoFile);
        const res = await api.post('/upload?type=video', data, config);
        videoUrl = res.data;
      }

      const payload = { ...formData, thumbnailUrl, videoUrl };
      if (!payload.category && categories.length > 0) payload.category = categories[0].name;

      if (editingVideo) {
        await api.put(`/admin/videos/${editingVideo._id}`, payload);
        toast.success("Updated!");
      } else {
        if (!videoFile) throw new Error("Please select a video file first.");
        await api.post('/admin/videos', payload);
        toast.success("Created!");
      }
      setShowFormModal(false);
      fetchData();
    } catch (error) { 
      console.error(error);
      const serverError = error.response?.data?.message || error.response?.data;
      toast.error(serverError || error.message || "Operation Failed");
    } 
    finally { setSubmitting(false); }
  };

  const openAddModal = () => {
    setEditingVideo(null);
    setFormData({ title: '', category: categories[0]?.name || '', description: '', duration: '' });
    setThumbnailFile(null); setVideoFile(null); setShowFormModal(true);
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setFormData({ title: video.title, category: video.category, description: video.description, duration: video.duration });
    setThumbnailFile(null);
    setVideoFile(null);
    setShowFormModal(true);
  };

  const deleteHandler = (id) => {
    setDeleteModal({
      isOpen: true,
      action: async () => {
        try { await api.delete(`/admin/videos/${id}`); setVideos(videos.filter(v => v._id !== id)); toast.success("Deleted"); } 
        catch (error) { toast.error("Failed"); }
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <ConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} onConfirm={deleteModal.action} title="Delete Video?" isDanger={true} />

      {/* --- BIG IMAGE VIEWER --- */}
      {viewImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4 animate-in fade-in cursor-pointer" onClick={() => setViewImage(null)}>
           <img src={getProxyUrl(viewImage)} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain cursor-default" onClick={(e) => e.stopPropagation()}/>
           <button className="absolute top-5 right-5 text-white bg-white/20 p-2 rounded-full hover:bg-white/40 transition"><X size={24}/></button>
        </div>
      )}

      {/* --- VIDEO PLAYER --- */}
      {viewVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in">
          <div className="w-full max-w-4xl bg-black rounded-xl overflow-hidden relative shadow-2xl">
            <button onClick={() => setViewVideo(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition cursor-pointer"><X size={24}/></button>
            <video src={getProxyUrl(viewVideo.videoUrl)} className="w-full max-h-[80vh]" controls autoPlay />
          </div>
        </div>
      )}

      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          {/* --- FILM LOGO ADDED --- */}
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Film className="text-blue-600"/> Video Library</h1>
          
          <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 font-medium transition-colors cursor-pointer">
            <Plus size={20} /> Add New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading 
            ? [1,2,3,4,5,6].map(i => <MediaSkeleton key={i} />) 
            : videos.map(video => (
                <MediaCard 
                  key={video._id} 
                  data={video} 
                  type="video" 
                  onPlay={setViewVideo} 
                  onViewImage={setViewImage}
                  onEdit={openEditModal} 
                  onDelete={deleteHandler} 
                />
              ))
          }
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{editingVideo ? 'Edit Video' : 'Upload Video'}</h2>
              <button onClick={() => setShowFormModal(false)}><X className="text-gray-400 hover:text-red-500 transition cursor-pointer" /></button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
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

                <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition ${videoFile ? 'border-green-400 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                    <Film size={32} className={videoFile ? "text-green-600" : "text-blue-500"}/>
                    <p className="text-sm font-bold mt-2">{videoFile ? videoFile.name : (editingVideo ? "Keep Current Video" : "Upload Video")}</p>
                    <input type="file" accept="video/*" className="hidden" id="vidUpload" onChange={handleVideoSelect} />
                    <label htmlFor="vidUpload" className="mt-2 text-xs text-blue-600 underline cursor-pointer hover:text-blue-800">Choose File</label>
                </div>

                <div className="border border-dashed p-3 rounded-lg flex items-center gap-4 hover:bg-gray-50 transition">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center">
                       {thumbnailFile ? (
                         <img src={URL.createObjectURL(thumbnailFile)} className="w-full h-full object-cover"/>
                       ) : (editingVideo?.thumbnailUrl) ? (
                         <img src={getProxyUrl(editingVideo.thumbnailUrl)} className="w-full h-full object-cover"/>
                       ) : (
                         <ImageIcon className="text-gray-400"/>
                       )}
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-700">Thumbnail</p>
                       <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files[0])} className="text-sm mt-1 text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
                    </div>
                </div>

                <div className="col-span-2">
                   <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                   <textarea className="w-full border p-2.5 rounded-lg h-20 outline-none focus:ring-2 focus:ring-blue-500 transition" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>

                <button disabled={submitting} className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition shadow-md cursor-pointer flex justify-center items-center">
                   {submitting ? <Loader2 className="animate-spin"/> : "Save Video"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;