import React from 'react';
import { MessageSquareOff, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ComplaintEmptyState = ({ 
  title = "No Complaints Found", 
  description = "We couldn't find any complaints matching your criteria.",
  showAction = false,
  actionText = "Submit New Complaint",
  actionLink = "/complaints/apply"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600 shadow-inner">
        <MessageSquareOff size={48} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {showAction && (
        <Link 
          to={actionLink}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all active:scale-95"
        >
          <Plus size={20} />
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default ComplaintEmptyState;
