import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api';
import { toast } from 'react-toastify';
import { 
  Video, Trash2, Edit2, Plus, Play, Image as ImageIcon, Clock, Save, X, PlayCircle, UploadCloud, Loader, Film, FileVideo
} from 'lucide-react';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // UI States
  const [showFormModal, setShowFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, action: null });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '',
    category: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchVideos(); fetchCategories(); }, []);

  const fetchVideos = async () => {
    try {
      const { data } = await api.get('/videos');
      setVideos(data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) { console.error(err); }
  };

  // --- HELPER: Format Seconds to MM:SS ---
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    // Add leading zeros (e.g., 5:9 -> 05:09)
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- UPLOAD HANDLER (Auto-Detects Duration) ---
// --- UPLOAD HANDLER (With Strict Validation) ---
  const uploadHandler = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. VALIDATION: Check File Type
    if (field === 'videoUrl') {
      // If uploading main video, MUST be video
      if (!file.type.startsWith('video/')) {
        toast.error("⛔ Only Video files (MP4, MKV) are allowed here!");
        return; // Stop execution
      }
    } else if (field === 'thumbnailUrl') {
      // If uploading thumbnail, MUST be image
      if (!file.type.startsWith('image/')) {
        toast.error("⛔ Only Image files (JPG, PNG) are allowed for thumbnails!");
        return; // Stop execution
      }
    }

    // 2. AUTO-DETECT DURATION (Only for videos)
    if (field === 'videoUrl') {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.src = URL.createObjectURL(file);
      
      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        const durationStr = formatDuration(videoElement.duration);
        setFormData(prev => ({ ...prev, duration: durationStr }));
        toast.info(`Duration detected: ${durationStr}`);
      };
    }

    // 3. Upload to Server
    const uploadData = new FormData();
    uploadData.append('image', file);

    if (field === 'videoUrl') setUploadingVideo(true);
    else setUploadingThumb(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/upload', uploadData, config);
      const fullUrl = `http://localhost:5000${data}`; 
      
      setFormData((prev) => ({ ...prev, [field]: fullUrl }));
      toast.success(field === 'videoUrl' ? "Video Uploaded!" : "Thumbnail Uploaded!");
    } catch (error) {
      console.error(error);
      toast.error('Upload Failed');
    } finally {
      setUploadingVideo(false);
      setUploadingThumb(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.videoUrl || !formData.category) {
      return toast.error("Title, Video, and Category are required");
    }

    try {
      if (isEditing) {
        await api.put(`/admin/videos/${editId}`, formData);
        toast.success("Video Updated!");
      } else {
        await api.post('/admin/videos', { ...formData, duration: formData.duration || "00:00" });
        toast.success("Video Saved!");
      }
      setShowFormModal(false);
      resetForm();
      fetchVideos();
    } catch (error) { toast.error("Operation failed"); }
  };

  // Helpers
  const openAddModal = () => { resetForm(); setShowFormModal(true); };
  const openEditModal = (video) => {
    setFormData({
      title: video.title,
      description: video.description || '',
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      duration: video.duration,
      category: video.category
    });
    setEditId(video._id);
    setIsEditing(true);
    setShowFormModal(true);
  };
  const resetForm = () => {
    setFormData({ title: '', description: '', videoUrl: '', thumbnailUrl: '', duration: '', category: '' });
    setIsEditing(false); setEditId(null);
  };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const clickDelete = (id) => {
    setDeleteModal({ isOpen: true, action: async () => {
        try { await api.delete(`/admin/videos/${id}`); setVideos(videos.filter(v => v._id !== id)); toast.success("Deleted"); } 
        catch (error) { toast.error("Delete Failed"); }
    }});
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <ConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} onConfirm={deleteModal.action} title="Delete Video?" message="Irreversible action." isDanger={true} />

      {/* --- FORM MODAL --- */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Video' : 'Upload New Video'}</h2>
              <button onClick={() => setShowFormModal(false)}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div className="col-span-2">
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Title</label>
                  <input name="title" value={formData.title} onChange={handleChange} placeholder="Video Title" className="w-full border p-3 rounded-lg focus:ring-blue-500 outline-none" />
                </div>

                {/* --- VIDEO UPLOAD SECTION --- */}
                <div className="bg-blue-50 border border-dashed border-blue-200 rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[150px]">
                  <label className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wider">Main Video File</label>
                  {formData.videoUrl ? (
                    <div className="flex flex-col items-center gap-2 text-green-600 font-bold">
                      <Film size={32} /> Video Ready!
                      <button type="button" onClick={() => setFormData({...formData, videoUrl: ''})} className="text-xs text-red-500 underline">Remove & Change</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-2 w-full h-full">
                      <div className="bg-white p-3 rounded-full text-blue-600 shadow-sm">
                        {uploadingVideo ? <Loader className="animate-spin" size={24} /> : <UploadCloud size={24} />}
                      </div>
                      <span className="text-blue-600 font-bold text-sm">{uploadingVideo ? "Uploading..." : "Upload Video (MP4)"}</span>
                      <input type="file" className="hidden" onChange={(e) => uploadHandler(e, 'videoUrl')} accept="video/*" disabled={uploadingVideo} />
                    </label>
                  )}
                </div>

                {/* --- THUMBNAIL UPLOAD SECTION --- */}
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[150px]">
                  <label className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Thumbnail (Optional)</label>
                  {formData.thumbnailUrl ? (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden group">
                      <img src={formData.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData({...formData, thumbnailUrl: ''})} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <X size={20} /> Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-2 w-full h-full">
                      <div className="bg-white p-3 rounded-full text-gray-500 shadow-sm">
                        {uploadingThumb ? <Loader className="animate-spin" size={24} /> : <ImageIcon size={24} />}
                      </div>
                      <span className="text-gray-500 font-medium text-sm">{uploadingThumb ? "Uploading..." : "Upload Cover Image"}</span>
                      <input type="file" className="hidden" onChange={(e) => uploadHandler(e, 'thumbnailUrl')} accept="image/*" disabled={uploadingThumb} />
                    </label>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-3 rounded-lg bg-white">
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>

                {/* DURATION (Now Auto-Calculated) */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Duration</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    <input 
                      name="duration" 
                      value={formData.duration} 
                      onChange={handleChange} 
                      placeholder="Auto-detected (e.g. 05:20)" 
                      className="w-full pl-9 border p-3 rounded-lg outline-none bg-gray-50" 
                    />
                  </div>
                </div>

                <div className="col-span-2">
                   <label className="text-sm font-bold text-gray-700 mb-1 block">Description</label>
                   <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What is this video about?" className="w-full border p-3 rounded-lg h-24 resize-none outline-none"></textarea>
                </div>
              </form>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button onClick={() => setShowFormModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 bg-white border border-gray-200">Cancel</button>
              <button onClick={handleSubmit} disabled={uploadingVideo || !formData.videoUrl} className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg ${uploadingVideo || !formData.videoUrl ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isEditing ? 'Save Changes' : 'Save Video'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN PAGE CONTENT --- */}
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3"><PlayCircle className="text-blue-600" /> Video Library</h1>
          <button onClick={openAddModal} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2"><Plus size={20} /> Add New Video</button>
        </div>

        {/* --- EMPTY STATE (SVG) --- */}
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="bg-blue-50 p-6 rounded-full mb-4">
              <FileVideo size={64} className="text-blue-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">No Videos Uploaded Yet</h3>
            <p className="text-gray-400 mt-2 max-w-sm text-center">
              Your library is looking empty. Upload your first video lesson to get started!
            </p>
            <button onClick={openAddModal} className="mt-6 text-blue-600 font-bold hover:underline">
              Upload Now &rarr;
            </button>
          </div>
        ) : (
          /* --- VIDEO GRID --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map(video => (
              <div key={video._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all">
                
                <div className="h-44 bg-black relative group">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <video 
                      src={video.videoUrl} 
                      className="w-full h-full object-cover" 
                      muted 
                      preload="metadata"
                      onMouseOver={event => event.target.play()} 
                      onMouseOut={event => event.target.pause()}
                    />
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition pointer-events-none">
                     <PlayCircle className="text-white opacity-80 group-hover:scale-110 transition drop-shadow-lg" size={48} />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold backdrop-blur-sm">{video.duration}</span>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 line-clamp-1" title={video.title}>{video.title}</h3>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button onClick={() => openEditModal(video)} className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition flex justify-center items-center gap-2"><Edit2 size={14}/> Edit</button>
                    <button onClick={() => clickDelete(video._id)} className="flex-1 py-2 rounded-lg bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100"><Trash2 size={14}/> Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;