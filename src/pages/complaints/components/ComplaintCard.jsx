import { format } from 'date-fns';
import { User, Clock, MessageSquare, AlertCircle, CheckCircle2, XCircle, Info, MoreVertical } from 'lucide-react';
import { useState } from 'react';

const STATUS_CONFIG = {
  Pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  Acknowledged: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Info },
  'In Review': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: MessageSquare },
  Resolved: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  Rejected: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle },
};

const PRIORITY_CONFIG = {
  High: 'bg-rose-500 text-white',
  Medium: 'bg-amber-500 text-white',
  Low: 'bg-emerald-500 text-white',
};

const ComplaintCard = ({ complaint, isDirector = false, onAction, onViewDetails }) => {
  const [showActions, setShowActions] = useState(false);
  const employee = complaint.employee || {};
  const statusInfo = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.Pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Priority Ribbon */}
      <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl ${PRIORITY_CONFIG[complaint.priority]}`}>
        {complaint.priority} Priority
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {employee.profileImageUrl ? (
              <img src={employee.profileImageUrl} alt={employee.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 shadow-sm" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <User size={24} />
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${complaint.status === 'Resolved' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          </div>
          <div className="cursor-pointer" onClick={() => onViewDetails?.(complaint)}>
            <h3 className="font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">{employee.name || 'Anonymous'}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                {employee.employeeCode || 'EMP-???'}
              </span>
              <span className="text-[10px] font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                {complaint.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 cursor-pointer" onClick={() => onViewDetails?.(complaint)}>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border mb-3 ${statusInfo.color}`}>
          <StatusIcon size={14} />
          {complaint.status}
        </div>
        <h4 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1">{complaint.title}</h4>
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
          {complaint.description}
        </p>
      </div>

      <div className="mt-auto space-y-4">
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-gray-300" />
            {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}
          </div>
          <button 
            onClick={() => onViewDetails?.(complaint)}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-tighter transition-colors"
          >
            <MessageSquare size={14} />
            {complaint.timeline?.length || 0} Events
          </button>
        </div>

        {complaint.directorComments && (
          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 text-sm text-indigo-900 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2 mb-1.5 text-indigo-600">
              <MessageSquare size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Director's Response</span>
            </div>
            <p className="text-xs leading-relaxed italic">"{complaint.directorComments}"</p>
          </div>
        )}

        {isDirector && onAction ? (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {complaint.status === 'Pending' && (
              <button
                onClick={() => onAction(complaint._id, 'Acknowledge')}
                className="col-span-2 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95"
              >
                Acknowledge Complaint
              </button>
            )}
            {['Pending', 'Acknowledged'].includes(complaint.status) && (
              <button
                onClick={() => onAction(complaint._id, 'In Review')}
                className="bg-purple-100 text-purple-700 py-2.5 rounded-xl text-xs font-bold hover:bg-purple-200 transition-all active:scale-95"
              >
                In Review
              </button>
            )}
            {['Acknowledged', 'In Review'].includes(complaint.status) && (
              <button
                onClick={() => onAction(complaint._id, 'Resolve')}
                className="bg-emerald-100 text-emerald-700 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-200 transition-all active:scale-95"
              >
                Resolve
              </button>
            )}
            {['Pending', 'Acknowledged', 'In Review'].includes(complaint.status) && (
               <button
                onClick={() => onAction(complaint._id, 'Reject')}
                className="bg-rose-100 text-rose-700 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-200 transition-all active:scale-95"
              >
                Reject
              </button>
            )}
          </div>
        ) : (
          <button 
            onClick={() => onViewDetails?.(complaint)}
            className="w-full bg-gray-50 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
          >
            View Full Progress
          </button>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;