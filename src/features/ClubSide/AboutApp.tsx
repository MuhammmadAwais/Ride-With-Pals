import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Trash2, Plus, GripVertical, Edit2, Eye, ArrowLeft, Shield, Clock, Database, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'; 



type Block = { id: string; content: string };

const PrivacyProtocol = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [protocolData, setProtocolData] = useState({
    revision: 'October 24, 2024',
    controller: 'LexElite Global Unit 01',
    status: 'GDPR & CCPA Certified'
  });
  
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', content: '01 About App' },
    { id: '2', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
    { id: '3', content: '02 Terms and Conditions' },
    { id: '4', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
    { id: '5', content: '03 Privacy Policy' },
    { id: '6', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },

  ]);

  useEffect(() => {
    console.log("Fetching data from DB...");
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      
      console.log("Saving to DB:", { protocolData, blocks });
      alert("Privacy Protocol Saved Permanently!");
      setIsEditing(false);
    } catch (error) {
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const addBlock = () => setBlocks([...blocks, { id: Date.now().toString(), content: 'New section...' }]);
  const deleteBlock = (id: string) => setBlocks(blocks.filter(b => b.id !== id));

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white overflow-hidden">
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <button className="lg:hidden absolute top-4 right-4" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
      </div>

      <main className="flex-1 h-full overflow-y-auto">
        <div className="p-6 flex items-center gap-4 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400"><Menu size={24} /></button>
        </div>

        <div className="p-6 md:p-12 lg:p-16 max-w-5xl mx-auto pb-20">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8">
            <ArrowLeft size={18} /> <span className="font-bold text-xs uppercase tracking-widest">Back</span>
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">Privacy <span className="text-[#EB712B]">Protocol</span></h1>
            <button onClick={() => setIsEditing(!isEditing)} className="p-4 bg-[#111] hover:bg-[#1a1a1a] rounded-2xl transition-all border border-white/5">
              {isEditing ? <Eye size={20} className="text-[#EB712B]" /> : <Edit2 size={20} />}
            </button>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[
              { label: 'LAST REVISION', value: protocolData.revision, key: 'revision', icon: Clock },
              { label: 'DATA CONTROLLER', value: protocolData.controller, key: 'controller', icon: Database },
              { label: 'LEGAL STATUS', value: protocolData.status, key: 'status', icon: Shield }
            ].map((item, i) => (
              <div key={i} className="bg-[#111] p-6 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-[#EB712B] tracking-widest mb-2 flex items-center gap-2"><item.icon size={12} /> {item.label}</p>
                {isEditing ? (
                  <input className="w-full bg-[#0a0a0a] text-sm font-semibold p-2 border border-white/10 rounded" value={item.value} onChange={(e) => setProtocolData({...protocolData, [item.key]: e.target.value})} />
                ) : <p className="text-sm font-semibold truncate">{item.value}</p>}
              </div>
            ))}
          </div>

          {/* Executive Summary Area */}
          <div className="bg-[#111] border border-white/5 rounded-3xl p-6 md:p-10">
            <h3 className="text-[#EB712B] font-bold text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#EB712B] rounded-full"></span> Executive Summary & Policies
            </h3>
            <div className="space-y-4">
              <AnimatePresence>
                {blocks.map((block) => (
                  <motion.div key={block.id} className="group flex items-center gap-4 p-2 rounded-2xl hover:bg-white/[0.02]">
                    <GripVertical className={`text-gray-700 ${isEditing ? 'cursor-grab' : 'hidden'}`} size={18} />
                    <div
                      contentEditable={isEditing}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        const newContent = e.currentTarget.innerText;
                        setBlocks(blocks.map(b => b.id === block.id ? {...b, content: newContent} : b));
                      }}
                      className={`flex-1 bg-transparent p-3 text-sm md:text-base outline-none ${isEditing ? 'border border-[#EB712B]/30 rounded-lg' : ''}`}
                    >
                      {block.content}
                    </div>
                    {isEditing && <button onClick={() => deleteBlock(block.id)} className="text-red-500/30 hover:text-red-500 p-2"><Trash2 size={16} /></button>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {isEditing && (
              <div className="mt-10 flex gap-4 pt-8 border-t border-white/5">
                <button onClick={addBlock} className="flex-1 py-4 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 text-gray-400 font-bold text-sm">
                  <Plus size={16} /> Add New Section
                </button>
                <button onClick={handleSave} className="flex-[2] py-4 bg-[#EB712B] hover:bg-[#ff8c4a] rounded-2xl font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2">
                  <Save size={16} /> {loading ? "Saving..." : "Save All Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyProtocol;