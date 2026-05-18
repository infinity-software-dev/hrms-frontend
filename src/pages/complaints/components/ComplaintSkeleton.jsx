import React from 'react';

const ComplaintSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse flex flex-col h-[320px]">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-100 rounded w-1/4"></div>
        </div>
      </div>
      
      <div className="space-y-3 flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-gray-100 rounded w-full"></div>
          <div className="h-3 bg-gray-100 rounded w-full"></div>
          <div className="h-3 bg-gray-100 rounded w-2/3"></div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between">
        <div className="h-3 bg-gray-100 rounded w-20"></div>
        <div className="h-3 bg-gray-100 rounded w-16"></div>
      </div>
    </div>
  );
};

export const ComplaintGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <ComplaintSkeleton key={i} />
      ))}
    </div>
  );
};

export default ComplaintSkeleton;
