import React from 'react';
import { Filters, FilterOperator } from '../types';

interface FilterBarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const FilterControl: React.FC<{
    label: string;
    filterKey: keyof Filters;
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}> = ({ label, filterKey, filters, setFilters }) => {

    const value = filters[filterKey]?.value ?? '';
    const operator = filters[filterKey]?.operator ?? '>=';

    const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newOperator = e.target.value as FilterOperator;
        if (value !== '') {
            setFilters(prev => ({ ...prev, [filterKey]: { value: Number(value), operator: newOperator } }));
        }
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (newValue === '') {
            setFilters(prev => ({ ...prev, [filterKey]: null }));
        } else {
            setFilters(prev => ({ ...prev, [filterKey]: { value: Number(newValue), operator } }));
        }
    };

    const clearFilter = () => {
        setFilters(prev => ({ ...prev, [filterKey]: null }));
    }

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={`filter-${filterKey}`} className="text-sm font-medium text-slate-400">{label}</label>
            <div className="flex items-center gap-1">
                <select 
                    value={operator} 
                    onChange={handleOperatorChange} 
                    className="h-10 bg-slate-700 border border-slate-600 rounded-l-md px-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    aria-label={`Operator for ${label}`}
                >
                    <option value=">=">≥</option>
                    <option value="<=">≤</option>
                    <option value="==">=</option>
                </select>
                <div className="relative flex-grow">
                    <input 
                        id={`filter-${filterKey}`}
                        type="number" 
                        value={value} 
                        onChange={handleValueChange} 
                        className="w-full h-10 bg-slate-800 border-y-2 border-slate-700 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder-slate-500"
                        placeholder="e.g., 10" 
                        min="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">%</span>
                </div>
                <button 
                    onClick={clearFilter} 
                    className={`h-10 w-10 bg-slate-700 border border-slate-600 rounded-r-md text-slate-400 hover:bg-slate-600 transition-colors ${!filters[filterKey] ? 'invisible' : ''}`}
                    aria-label={`Clear filter for ${label}`}
                >
                    &times;
                </button>
            </div>
        </div>
    );
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg mb-4 ring-1 ring-white/10" role="search" aria-label="Filter search results">
      <h3 className="text-lg font-semibold mb-3 text-slate-300">Filter Results</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FilterControl label="Duty (NPF)" filterKey="dutyNPF" filters={filters} setFilters={setFilters} />
        <FilterControl label="Duty (ZLECAf)" filterKey="dutyZLECAf" filters={filters} setFilters={setFilters} />
        <FilterControl label="VAT/Other" filterKey="vat" filters={filters} setFilters={setFilters} />
      </div>
    </div>
  );
};

export default FilterBar;
