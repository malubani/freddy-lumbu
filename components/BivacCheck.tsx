import React, { useState } from 'react';
import { checkBivacStatus } from '../services/geminiService';
import { BivacReport } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const BivacCheck: React.FC = () => {
  const [bivacId, setBivacId] = useState('');
  const [report, setReport] = useState<BivacReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBivacCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bivacId.trim()) {
      setError("Please enter a BIVAC number.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const data = await checkBivacStatus(bivacId);
      if (data.status === 'Not Found') {
        setError(`BIVAC Report for "${bivacId}" not found. Please check the number and try again.`);
        setReport(null);
      } else {
        setReport(data);
      }
    } catch (err) {
      setError("An error occurred while fetching the BIVAC report. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

   const getStatusClass = (status: string) => {
    switch(status?.toLowerCase()) {
        case 'compliant': return 'text-green-400 font-semibold';
        case 'non-compliant': return 'text-red-400 font-semibold';
        case 'pending': return 'text-amber-400 font-semibold';
        default: return 'text-slate-300';
    }
  }

  const renderReport = () => {
    if (!report) return null;

    const reportFields = [
      { label: 'Report Number', value: report.reportNumber },
      { label: 'Inspection Date', value: report.inspectionDate },
      { label: 'Status', value: report.status, statusClass: getStatusClass(report.status) },
      { label: 'Exporter', value: report.exporter },
      { label: 'Importer', value: report.importer },
      { label: 'Goods Description', value: report.goodsDescription },
      { label: 'FOB Value', value: report.fobValue },
      { label: 'HS Code', value: report.hsCode },
      { label: 'Observations', value: report.observations },
    ];

    return (
        <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg ring-1 ring-white/10 mt-8">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4 border-b-2 border-slate-700 pb-2">BIVAC Inspection Report</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {reportFields.map(field => (
                     <div key={field.label} className="py-2">
                        <dt className="text-sm font-medium text-slate-400">{field.label}</dt>
                        <dd className={`mt-1 text-lg ${field.statusClass || 'text-white'}`}>{field.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
  };

  const renderInitialState = () => (
    <div className="text-center p-10 bg-slate-800/50 rounded-xl flex flex-col items-center">
      <i className="fas fa-file-shield text-5xl text-cyan-500 mb-4"></i>
      <h2 className="text-2xl font-semibold text-slate-200">BIVAC Inspection Check</h2>
      <p className="mt-2 max-w-2xl text-slate-400">
        Enter a BIVAC report number to check its inspection status and details.
      </p>
    </div>
  );

  return (
    <div role="tabpanel" id="bivac-panel" aria-labelledby="bivac-tab">
        <form onSubmit={handleBivacCheck} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
                <i className="fa fa-file-shield absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input
                type="text"
                value={bivacId}
                onChange={(e) => setBivacId(e.target.value)}
                placeholder="Enter BIVAC number..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder-slate-500"
                disabled={isLoading}
                />
            </div>
            <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
            >
                {isLoading ? 'Checking...' : 'Check Status'}
            </button>
        </form>
        <div className="mt-8">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {report && renderReport()}
            {!isLoading && !error && !report && renderInitialState()}
        </div>
    </div>
  );
};

export default BivacCheck;
