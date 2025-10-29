import React, { useState } from 'react';
import { getVehicleReport } from '../services/geminiService';
import { VehicleReport } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const VehicleCheck: React.FC = () => {
  const [chassisNumber, setChassisNumber] = useState('');
  const [report, setReport] = useState<VehicleReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVehicleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chassisNumber.trim()) {
      setError("Please enter a Chassis Number (VIN).");
      return;
    }
    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const data = await getVehicleReport(chassisNumber);
      if (data.make === 'Not Found') {
        setError(`Technical report for chassis number "${chassisNumber}" not found. Please check the number and try again.`);
        setReport(null);
      } else {
        setReport(data);
      }
    } catch (err) {
      setError("An error occurred while fetching the vehicle report. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderReport = () => {
    if (!report) return null;

    const reportFields = [
      { label: 'Chassis Number (VIN)', value: report.chassisNumber },
      { label: 'Make', value: report.make },
      { label: 'Model', value: report.model },
      { label: 'Year', value: report.year?.toString() },
      { label: 'Engine Displacement', value: report.engineDisplacement },
      { label: 'Fuel Type', value: report.fuelType },
      { label: 'Country of Origin', value: report.countryOfOrigin },
      { label: 'Estimated Value (CIF)', value: report.estimatedValueCIF },
      { label: 'Applicable HS Code', value: report.hsCode },
      { label: 'Technical Observations', value: report.technicalObservations },
    ];
    
    return (
        <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg ring-1 ring-white/10 mt-8">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4 border-b-2 border-slate-700 pb-2">Vehicle Technical Report</h3>
             <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {reportFields.map(field => (
                     <div key={field.label} className="py-2">
                        <dt className="text-sm font-medium text-slate-400">{field.label}</dt>
                        <dd className="mt-1 text-lg text-white">{field.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
  };

  const renderInitialState = () => (
    <div className="text-center p-10 bg-slate-800/50 rounded-xl flex flex-col items-center">
      <i className="fas fa-car text-5xl text-cyan-500 mb-4"></i>
      <h2 className="text-2xl font-semibold text-slate-200">Vehicle Chassis Check</h2>
      <p className="mt-2 max-w-2xl text-slate-400">
        Enter a vehicle's chassis number (VIN) to generate a technical report for customs purposes.
      </p>
    </div>
  );


  return (
    <div role="tabpanel" id="vehicle-panel" aria-labelledby="vehicle-tab">
      <form onSubmit={handleVehicleCheck} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
            <i className="fa fa-car absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input
            type="text"
            value={chassisNumber}
            onChange={(e) => setChassisNumber(e.target.value)}
            placeholder="Enter vehicle chassis number (VIN)..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder-slate-500"
            disabled={isLoading}
            />
        </div>
        <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
        >
            {isLoading ? 'Generating...' : 'Get Technical Report'}
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

export default VehicleCheck;
