import { useState } from 'react';
import { Play, Edit, Trash2, Film, Music, ImageOff, AlertCircle } from 'lucide-react';

const MediaCard = ({ data, type, onPlay, onEdit, onDelete, onViewImage }) => {
  const [imgError, setImgError] = useState(false);
  const isVideo = type === 'video';

  // --- HELPER: Fix Broken URLs ---
  const getProxyUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `http://localhost:5000${url}`; 
  };

  const finalImage = getProxyUrl(data.thumbnailUrl || data.imageUrl);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      
      {/* --- 1. THUMBNAIL AREA --- */}
      <div className="relative w-full aspect-video bg-gray-50 overflow-hidden">
        
        {!finalImage ? (
          // CASE 1: No Image
          <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${isVideo ? 'bg-gray-100' : 'bg-purple-50'}`}>
            {isVideo ? <Film className="text-gray-300" size={32} /> : <Music className="text-purple-200" size={32} />}
            <span className="text-xs font-bold text-gray-400 uppercase">No Image</span>
          </div>
        ) : imgError ? (
          // CASE 2: Error
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-red-50 border border-red-100">
            <AlertCircle className="text-red-300" size={32} />
            <span className="text-xs font-bold text-red-400 uppercase">Load Failed</span>
          </div>
        ) : (
          // CASE 3: Normal Image
          <img 
            src={finalImage} 
            alt={data.title} 
            className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
            onClick={() => onViewImage && onViewImage(finalImage)}
            onError={() => setImgError(true)} 
          />
        )}

        {/* Duration Badge */}
        {data.duration && (
          <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
             {data.duration}
          </div>
        )}
      </div>

      {/* --- 2. CONTENT AREA --- */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Category Badge */}
        <div className="mb-2">
          <span className={`inline-block text-[11px] uppercase font-bold px-3 py-1 rounded-lg tracking-wider ${isVideo ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
            {data.category || "General"}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-800 text-lg mb-3 line-clamp-1" title={data.title}>
          {data.title}
        </h3>

        {/* --- DESCRIPTION (Conditionally Rendered) --- */}
        {data.description && (
          <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">
            {data.description}
          </p>
        )}

        {/* --- 3. BOTTOM ACTIONS --- */}
        {/* mt-auto pushes this section to the bottom even if description is missing */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          
          {/* Play Button */}
          <button 
            onClick={() => onPlay(data)}
            className="px-6 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            <Play size={18} fill="currentColor" /> Play
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(data); }}
              className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            >
              <Edit size={20} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(data._id); }}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 size={20} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MediaCard;