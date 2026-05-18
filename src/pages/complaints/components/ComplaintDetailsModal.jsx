import React from 'react';
import { X, Clock, User, MessageSquare, ShieldCheck, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  Pending: { color: 'bg-amber-100 text-amber-700', icon: Clock },
  Acknowledged: { color: 'bg-blue-100 text-blue-700', icon: ShieldCheck },
  'In Review': { color: 'bg-purple-100 text-purple-700', icon: MessageSquare },
  Resolved: { color: 'bg-emerald-100 text-emerald-700', icon: ShieldCheck },
  Rejected: { color: 'bg-rose-100 text-rose-700', icon: X, iconColor: 'text-rose-600' },
};

const ComplaintDetailsModal = ({ isOpen, onClose, complaint }) => {
  if (!isOpen || !complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-black text-gray-900">Complaint Details</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">ID: {complaint?._id?.slice(-8) || 'N/A'}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-2xl transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Main Info */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                complaint.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                complaint.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {complaint.priority} Priority
              </div>
              <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-tighter border border-indigo-100">
                {complaint.category}
              </div>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">{complaint.title}</h4>
            <div className="bg-gray-50 rounded-2xl p-6 text-gray-700 leading-relaxed text-sm italic border border-gray-100">
              "{complaint.description}"
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calendar size={16} />
              Activity Timeline
            </h4>
            <div className="space-y-6 relative ml-4 border-l-2 border-gray-100 pl-8">
              {complaint.timeline?.map((event, index) => (
                <div key={index} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-white border-4 border-indigo-600 shadow-sm z-10"></div>
                  
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-900">{event.action}</span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {(() => {
                          try {
                            return format(new Date(event.timestamp), 'MMM dd, yyyy • HH:mm');
                          } catch (e) {
                            return 'Invalid Date';
                          }
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-600">
                        <User size={12} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                        {event.actionBy?.name || 'System'} • {event.role}
                      </span>
                    </div>
                    {event.comments && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl italic">
                        "{event.comments}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailsModal;
