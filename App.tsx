import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ResultsDisplay from './components/ResultsDisplay';
import { searchTariffs } from './services/geminiService';
import { TariffItem, Filters, FilterCondition } from './types';
import InitialState from './components/InitialState';
import Tabs from './components/Tabs';
import BivacCheck from './components/BivacCheck';
import VehicleCheck from './components/VehicleCheck';
import Chatbot from './components/Chatbot';
import LiveChat from './components/LiveChat';


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tariff' | 'bivac' | 'vehicle' | 'chatbot' | 'live-chat'>('tariff');
  const [query, setQuery] = useState<string>('');
  const [originalResults, setOriginalResults] = useState<TariffItem[]>([]);
  const [results, setResults] = useState<TariffItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    dutyNPF: null,
    dutyZLECAf: null,
    vat: null,
  });

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const queryToUse = typeof searchQuery === 'string' ? searchQuery : query;

    if (typeof searchQuery === 'string') {
      setQuery(searchQuery); // Keep UI in sync with search
    }
    
    if (!queryToUse.trim()) {
      setError("Please enter a search query.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setOriginalResults([]);
    setResults([]);
    setFilters({ dutyNPF: null, dutyZLECAf: null, vat: null });

    try {
      const data = await searchTariffs(queryToUse);
      setOriginalResults(data);
      setResults(data);
    } catch (err) {
      setError("An error occurred while fetching tariff data. Please check your connection or try a different query.");
      setOriginalResults([]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const parsePercentage = (value: string): number | null => {
      if (!value || typeof value !== 'string') return null;
      if (value.toLowerCase().includes('exempt')) return 0;
      const cleanedValue = value.replace(/%/g, '').replace(/,/g, '.').trim();
      const num = parseFloat(cleanedValue);
      return isNaN(num) ? null : num;
    };

    const applyFilter = (itemValue: number | null, condition: FilterCondition | null): boolean => {
      if (condition === null || itemValue === null) return true;
      switch (condition.operator) {
        case '>=': return itemValue >= condition.value;
        case '<=': return itemValue <= condition.value;
        case '==': return itemValue === condition.value;
        default: return true;
      }
    };

    const filteredResults = originalResults.filter(item => {
      const dutyNPFValue = parsePercentage(item.dutyNPF);
      const dutyZLECAfValue = parsePercentage(item.dutyZLECAf);
      const vatValue = parsePercentage(item.vat);

      return (
        applyFilter(dutyNPFValue, filters.dutyNPF) &&
        applyFilter(dutyZLECAfValue, filters.dutyZLECAf) &&
        applyFilter(vatValue, filters.vat)
      );
    });

    setResults(filteredResults);
  }, [filters, originalResults]);

  const handleExportCSV = useCallback(() => {
    if (results.length === 0) {
      return;
    }

    const headers = [
      "Tariff Code",
      "Description",
      "Unit",
      "Duty (NPF)",
      "Duty (ZLECAf)",
      "VAT/Other",
    ];

    const escapeCSV = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

    const csvRows = [headers.join(',')];

    results.forEach(item => {
      const row = [
        escapeCSV(item.tariffCode),
        escapeCSV(item.description),
        escapeCSV(item.unit),
        escapeCSV(item.dutyNPF),
        escapeCSV(item.dutyZLECAf),
        escapeCSV(item.vat),
      ].join(',');
      csvRows.push(row);
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'drc_tariff_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [results]);


  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />
        <main className="mt-8">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="mt-6">
            {activeTab === 'tariff' && (
              <div role="tabpanel" id="tariff-panel" aria-labelledby="tariff-tab">
                <div className="sticky top-4 z-20 bg-slate-900/80 backdrop-blur-md py-4 rounded-lg">
                  <SearchBar
                    query={query}
                    setQuery={setQuery}
                    handleSearch={handleSearch}
                    isLoading={isLoading}
                  />
                </div>
                <div className="mt-8">
                  {!hasSearched ? (
                    <InitialState />
                  ) : (
                    <ResultsDisplay
                      isLoading={isLoading}
                      error={error}
                      results={results}
                      originalResultCount={originalResults.length}
                      onExport={handleExportCSV}
                      filters={filters}
                      setFilters={setFilters}
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bivac' && <BivacCheck />}
            {activeTab === 'vehicle' && <VehicleCheck />}
            {activeTab === 'chatbot' && <Chatbot />}
            {activeTab === 'live-chat' && <LiveChat />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;