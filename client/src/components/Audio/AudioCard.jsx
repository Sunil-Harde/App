import { useState } from 'react';
import { Play, Trash2, Edit, Music, X, Pause } from 'lucide-react';

const AudioCard = ({ audio, onDelete, onEdit }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group h-full flex flex-col">
      
      {/* --- 1. TOP: MEDIA AREA (Image Always Visible) --- */}
      <div className="h-48 bg-gray-50 relative border-b border-gray-50">
        {audio.imageUrl ? (
          <img 
            src={`http://localhost:5000${audio.imageUrl}`} 
            alt={audio.title}
            className={`w-full h-full object-cover transition duration-700 ${isPlaying ? 'scale-105' : 'group-hover:scale-105'}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300">
            <Music size={48} />
            <span className="text-xs mt-2">No Cover</span>
          </div>
        )}
        
        {/* Overlay Badge */}
        <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md shadow-sm z-10">
          {audio.duration}
        </span>

        {/* Play Icon Overlay (Only visible when NOT playing) */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer" onClick={() => setIsPlaying(true)}>
            <div className="bg-white/90 text-blue-600 rounded-full p-3 shadow-lg transform hover:scale-110 transition">
               <Play size={28} fill="currentColor" className="ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* --- 2. BOTTOM: INFO & CONTROLS --- */}
      <div className="p-4 flex flex-col flex-1">
        
        {/* Tags & Title */}
        <div className="mb-3">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
            {audio.category}
          </span>
        </div>
        
        <h3 className="text-gray-800 font-bold text-lg leading-tight mb-auto line-clamp-2" title={audio.title}>
          {audio.title}
        </h3>

        {/* --- 3. DYNAMIC FOOTER --- */}
        <div className="mt-4 pt-4 border-t border-gray-100 min-h-[50px] flex items-center">
          
          {isPlaying ? (
            // A. PLAYER MODE (Shows Audio Controls)
            <div className="w-full flex items-center gap-2 animate-fadeIn bg-gray-50 p-1 rounded-lg">
               <audio 
                 controls 
                 autoPlay 
                 className="w-full h-8 custom-audio-player"
                 src={`http://localhost:5000${audio.audioUrl}`}
                 onEnded={() => setIsPlaying(false)} 
               />
               <button 
                 onClick={() => setIsPlaying(false)}
                 className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                 title="Close Player"
               >
                 <X size={18} />
               </button>
            </div>
          ) : (
            // B. BUTTON MODE (Shows Play, Edit, Delete)
            <div className="w-full flex justify-between items-center animate-fadeIn">
              
              {/* Play Button */}
              <button 
                onClick={() => setIsPlaying(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow transition"
              >
                <Play size={14} fill="currentColor" /> Play
              </button>

              {/* Edit/Delete Actions */}
              <div className="flex gap-1">
                <button 
                  onClick={() => onEdit(audio)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => onDelete(audio._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AudioCard;