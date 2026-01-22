import { X } from 'lucide-react';

const AudioPlayer = ({ audio, onClose }) => {
  if (!audio) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl relative text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
          <X size={24} />
        </button>
        
        <div className="w-24 h-24 bg-gray-100 rounded-lg mx-auto mb-6 overflow-hidden shadow-md">
           <img 
            src={`http://localhost:5000${audio.imageUrl}`} 
            className="w-full h-full object-cover" 
            alt="cover" 
           />
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-1">{audio.title}</h3>
        <p className="text-blue-600 text-sm font-medium mb-6 uppercase">{audio.category}</p>
        
        <audio controls autoPlay className="w-full">
          <source src={`http://localhost:5000${audio.audioUrl}`} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default AudioPlayer;