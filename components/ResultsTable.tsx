
import React from 'react';
import { TariffItem } from '../types';

interface ResultsTableProps {
  items: TariffItem[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ items }) => {
  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg ring-1 ring-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-4 text-sm font-semibold text-cyan-400 tracking-wider">Tariff Code</th>
              <th className="p-4 text-sm font-semibold text-cyan-400 tracking-wider">Description</th>
              <th className="p-4 text-sm font-semibold text-cyan-400 tracking-wider text-center">Unit</th>
              <th className="p-4 text-sm font-semibold text-cyan-400 tracking-wider text-center">Duty (NPF)</th>
              <th className="p-4 text-sm font-semibold text-cyan-400 tracking-wider text-center">Duty (ZLECAf)</th>
              <th className="p-4 text-sm font-semibold text-cyan-400 tracking-wider text-center">VAT/Other</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-slate-800 transition-colors duration-200">
                <td className="p-4 font-mono text-cyan-300">{item.tariffCode}</td>
                <td className="p-4">{item.description}</td>
                <td className="p-4 text-center">{item.unit}</td>
                <td className="p-4 text-center">{item.dutyNPF}</td>
                <td className="p-4 text-center">{item.dutyZLECAf}</td>
                <td className="p-4 text-center">{item.vat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
