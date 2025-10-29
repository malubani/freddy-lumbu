
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center p-6 border-b-2 border-slate-700">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-400 tracking-tight">
        DRC Tariff Finder
      </h1>
      <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
        Search the Democratic Republic of Congo's Import/Export Duties and Taxes (ZLECAf / SH 2017)
      </p>
    </header>
  );
};

export default Header;
