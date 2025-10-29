import React from 'react';
import { TariffItem, Filters } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ResultsTable from './ResultsTable';
import NoResults from './NoResults';
import FilterBar from './FilterBar';

interface ResultsDisplayProps {
  isLoading: boolean;
  error: string | null;
  results: TariffItem[];
  originalResultCount: number;
  onExport: () => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, error, results, originalResultCount, onExport, filters, setFilters }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (originalResultCount === 0) {
    return <NoResults />;
  }

  const hasActiveFilters = Object.values(filters).some(f => f !== null);

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} setFilters={setFilters} />
      <div className="flex justify-between items-center flex-wrap gap-2">
        <p className="text-sm text-slate-400">
          {hasActiveFilters ? `Showing ${results.length} of ${originalResultCount} results.` : `Found ${originalResultCount} results.`}
        </p>
        <button
          onClick={onExport}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Export results to CSV"
          disabled={results.length === 0}
        >
          <i className="fas fa-file-csv"></i>
          <span>Export as CSV</span>
        </button>
      </div>
      
      {results.length > 0 ? (
        <ResultsTable items={results} />
      ) : (
        <div className="text-center p-10 bg-slate-800/50 rounded-xl flex flex-col items-center">
            <i className="fas fa-filter text-5xl text-amber-500 mb-4"></i>
            <h2 className="text-2xl font-semibold text-slate-200">No Matching Results</h2>
            <p className="mt-2 max-w-2xl text-slate-400 mx-auto">
                Your filters did not match any of the search results. Try adjusting or clearing some filters.
            </p>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
