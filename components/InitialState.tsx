
import React from 'react';

const InitialState: React.FC = () => {
  return (
    <div className="text-center p-10 bg-slate-800/50 rounded-xl flex flex-col items-center">
        <i className="fas fa-book-open text-5xl text-cyan-500 mb-4"></i>
        <h2 className="text-2xl font-semibold text-slate-200">Welcome to the DRC Tariff Finder</h2>
        <p className="mt-2 max-w-2xl text-slate-400">
            Enter a product name, partial description, or tariff code in the search bar above to look up the relevant import/export duties and taxes. The intelligent search will provide you with a structured view of the official 2021 tariff schedule.
        </p>
    </div>
  );
};

export default InitialState;
