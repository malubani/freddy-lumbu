import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getTariffSuggestions } from '../services/geminiService';
import { Suggestion } from '../types';

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  handleSearch: (searchQuery?: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, handleSearch, isLoading }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLFormElement>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSuggestionsLoading(true);
    try {
      const suggs = await getTariffSuggestions(searchQuery);
      setSuggestions(suggs);
      setShowSuggestions(suggs.length > 0);
    } catch (e) {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query && !isLoading) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [query, fetchSuggestions, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuggestions(false);
    handleSearch();
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion.suggestion);
  };

  return (
    <form onSubmit={onSearchSubmit} ref={searchContainerRef} className="relative flex flex-col sm:flex-row gap-3">
      <div className="relative flex-grow">
        <i className="fa fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10"></i>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search by product, code, or ask a question (e.g., 'taxes on coffee')..."
          className="w-full pl-12 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder-slate-500"
          disabled={isLoading}
          autoComplete="off"
        />
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border-2 border-slate-700 rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto">
            {isSuggestionsLoading ? (
                <div className="p-4 text-slate-400 text-center">Loading suggestions...</div>
            ) : (
            <ul role="listbox">
              {suggestions.map((s, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(s)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSuggestionClick(s); }}
                  className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center"
                  tabIndex={0}
                  role="option"
                  aria-selected="false"
                >
                  <span>{s.suggestion}</span>
                  <span className="text-xs uppercase bg-slate-600 text-slate-300 px-2 py-1 rounded-full">{s.type}</span>
                </li>
              ))}
            </ul>
            )}
          </div>
        )}
      </div>
      <button
        type="submit"
        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Searching...
          </>
        ) : (
          <span>Search</span>
        )}
      </button>
    </form>
  );
};

export default SearchBar;