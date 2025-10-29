
import React from 'react';

const NoResults: React.FC = () => {
  return (
    <div className="text-center p-10 bg-slate-800/50 rounded-xl flex flex-col items-center">
        <i className="fas fa-search-minus text-5xl text-amber-500 mb-4"></i>
        <h2 className="text-2xl font-semibold text-slate-200">No Results Found</h2>
        <p className="mt-2 max-w-2xl text-slate-400">
            Your search did not match any items in the tariff schedule. Please try again with different or more general keywords.
        </p>
    </div>
  );
};

export default NoResults;
