import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api';
import { toast } from 'react-toastify';
import { BookOpen, Trash2, Send } from 'lucide-react';

const Journals = () => {
  const [journals, setJournals] = useState([]);
  const [content, setContent] = useState('');

  const fetchJournals = async () => {
    try {
      const { data } = await api.get('/journals');
      setJournals(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchJournals(); }, []);

  const addJournal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/journals', { content });
      setContent('');
      toast.success("Entry Saved");
      fetchJournals();
    } catch (error) { toast.error("Failed to save"); }
  };

  const deleteJournal = async (id) => {
    if(!window.confirm("Delete this entry?")) return;
    try {
      await api.delete(`/journals/${id}`);
      setJournals(journals.filter(j => j._id !== id));
      toast.success("Deleted");
    } catch (err) { toast.error("Error deleting"); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Daily Journal</h1>

        {/* Input Area */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
           <textarea
             className="w-full p-4 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 resize-none h-32"
             placeholder="How are you feeling today?"
             value={content}
             onChange={e => setContent(e.target.value)}
           ></textarea>
           <div className="flex justify-end mt-2">
             <button onClick={addJournal} disabled={!content.trim()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-300">
               <Send size={18} /> Save Entry
             </button>
           </div>
        </div>

        {/* Journal History */}
        <div className="grid grid-cols-1 gap-6">
          {journals.map(entry => (
            <div key={entry._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
              <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
                <span>{new Date(entry.createdAt).toLocaleString()}</span>
                <button onClick={() => deleteJournal(entry._id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Journals;