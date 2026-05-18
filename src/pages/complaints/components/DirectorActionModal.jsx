import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, ShieldCheck, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

const STATUS_OPTIONS = [
  { label: 'Acknowledged', value: 'Acknowledged', icon: ShieldCheck, color: '#2563EB', bg: '#DBEAFE' },
  { label: 'In Review', value: 'In Review', icon: MessageSquare, color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Resolved', value: 'Resolved', icon: CheckCircle, color: '#059669', bg: '#D1FAE5' },
  { label: 'Rejected', value: 'Rejected', icon: XCircle, color: '#DC2626', bg: '#FEE2E2' },
];

const DirectorActionModal = ({ isOpen, onClose, onConfirm, action, complaint }) => {
  const [comments, setComments] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (complaint) {
      setPriority(complaint.priority || 'Medium');
      setStatus(complaint.status || 'Pending');
    }
  }, [complaint, isOpen]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If action is strictly 'Resolve', we just send that. 
      // If action is 'Update', we send the selected status and priority.
      const finalAction = action === 'Update' ? status : action;
      await onConfirm(complaint._id, finalAction, comments, priority);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-400 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {action === 'Update' ? 'Manage Grievance' : `${action} Complaint`}
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Action Protocol Center</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all active:scale-90">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Complaint Preview */}
          <div className="bg-indigo-50/40 p-6 rounded-[2rem] border border-indigo-100/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertCircle size={80} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-tighter">
                        {complaint.category}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">ID: {complaint._id.slice(-6)}</span>
                </div>
                <p className="text-lg font-black text-indigo-950 leading-tight mb-2">{complaint.title}</p>
                <p className="text-sm text-indigo-700/80 line-clamp-3 leading-relaxed italic">"{complaint.description}"</p>
            </div>
          </div>

          {/* Action Grid (Status & Priority) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Status Picker (Only for 'Update' action) */}
            {action === 'Update' && (
                <div className="space-y-4">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Target Status</label>
                    <div className="grid grid-cols-1 gap-2">
                        {STATUS_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = status === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setStatus(opt.value)}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                                        isSelected 
                                        ? 'bg-white border-gray-900 shadow-xl shadow-gray-100 scale-[1.02] z-10' 
                                        : 'bg-gray-50 border-transparent text-gray-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: opt.bg, color: opt.color }}>
                                        <Icon size={20} strokeWidth={2.5} />
                                    </div>
                                    <span className={`text-sm font-black ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Priority Picker */}
            <div className="space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Urgency Level</label>
                <div className="flex flex-col gap-2">
                    {['Low', 'Medium', 'High'].map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`relative px-6 py-4 rounded-2xl text-sm font-black transition-all border-2 flex items-center justify-between overflow-hidden ${
                                priority === p 
                                ? 'bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-200' 
                                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                            }`}
                        >
                            <span>{p} Priority</span>
                            <div className={`w-2 h-2 rounded-full ${
                                p === 'High' ? 'bg-rose-500' : p === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                        </button>
                    ))}
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-4">
                    <div className="flex gap-3">
                        <Clock size={16} className="text-gray-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-gray-500 font-bold leading-normal">
                            Resolution timeline will be adjusted based on the selected urgency level.
                        </p>
                    </div>
                </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Decision Narrative</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide a professional rationale for this action..."
              rows={4}
              className="w-full px-6 py-5 rounded-[2rem] border-2 border-gray-100 focus:border-gray-900 focus:bg-white outline-none transition-all resize-none text-sm font-medium bg-gray-50/50"
              required={action === 'Reject' || action === 'Comment'}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-white flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-4 rounded-2xl text-sm font-black text-gray-400 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 max-w-[240px] px-8 py-4 rounded-[1.5rem] bg-gray-900 text-white font-black text-sm shadow-2xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={18} strokeWidth={2.5} />
                <span>Execute Action</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default DirectorActionModal;
