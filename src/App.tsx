import React, { useState, useEffect, useRef } from 'react';
import { Search, Book, Info, ChevronRight, Loader2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { liveSearch } from './services/geminiService';
import { LOCAL_DICTIONARY, type DictionaryEntry } from './data/dictionary';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const normalize = (str: string) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Immediate local search for "fatfat" results
  useEffect(() => {
    const trimmedQuery = query.trim().toLowerCase();
    const normalizedQuery = normalize(trimmedQuery);
    
    if (trimmedQuery.length < 1) {
      setResults([]);
      return;
    }

    const localMatches = LOCAL_DICTIONARY.filter(item => {
      const roman = item.word_roman.toLowerCase();
      const normalizedRoman = normalize(roman);
      const bangla = item.word_bangla.toLowerCase();
      const english = item.meaning_english.toLowerCase();
      const meaningBangla = item.meaning_bangla.toLowerCase();

      // Check if it starts with the query (most important for "fatfat" feel)
      const startsWithRoman = roman.startsWith(trimmedQuery) || normalizedRoman.startsWith(normalizedQuery);
      const startsWithBangla = bangla.startsWith(trimmedQuery);
      
      // Check if it's included (for meanings or middle-of-word matches)
      const includesRoman = roman.includes(trimmedQuery) || normalizedRoman.includes(normalizedQuery);
      const includesMeaning = english.includes(trimmedQuery) || meaningBangla.includes(trimmedQuery);

      // If query is short (1-2 chars), be more strict to show only "starts with"
      if (trimmedQuery.length <= 2) {
        return startsWithRoman || startsWithBangla;
      }

      return startsWithRoman || startsWithBangla || includesRoman || includesMeaning;
    }).sort((a, b) => {
      // Sort: Exact match first, then starts with, then the rest
      const aRoman = a.word_roman.toLowerCase();
      const bRoman = b.word_roman.toLowerCase();
      const aNorm = normalize(aRoman);
      const bNorm = normalize(bRoman);

      const aExact = aRoman === trimmedQuery || aNorm === normalizedQuery;
      const bExact = bRoman === trimmedQuery || bNorm === normalizedQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = aRoman.startsWith(trimmedQuery) || aNorm.startsWith(normalizedQuery);
      const bStarts = bRoman.startsWith(trimmedQuery) || bNorm.startsWith(normalizedQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return aRoman.localeCompare(bRoman);
    });

    if (localMatches.length > 0) {
      setResults(localMatches);
    }
  }, [query]);

  // Debounce for AI search (deeper analysis)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // Reduced debounce for faster feel
    return () => clearTimeout(timer);
  }, [query]);

  // Perform AI search in background if needed
  useEffect(() => {
    const performAISearch = async () => {
      if (debouncedQuery.trim().length < 1) return;
      
      // If we already have local results, we might still want to call AI 
      // for words not in our local list or for better meanings.
      setIsSearching(true);
      const aiResults = await liveSearch(debouncedQuery);
      
      if (aiResults.length > 0) {
        setResults(prev => {
          // Merge results, avoiding duplicates by word_roman
          const existingWords = new Set(prev.map(w => w.word_roman.toLowerCase()));
          const newWords = aiResults.filter(w => !existingWords.has(w.word_roman.toLowerCase()));
          return [...prev, ...newWords];
        });
      }
      setIsSearching(false);
    };
    performAISearch();
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <Book size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">BPM Digital</h1>
              <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-semibold">Bishnupriya Manipuri</p>
            </div>
          </div>
          <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <Info size={20} className="text-black/40" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Search Section */}
        <section className="relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={20} className="text-black/30 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type in Roman, Bangla, or English..."
              className="w-full bg-white border border-black/10 rounded-2xl py-4 pl-12 pr-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-black/20"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-4 flex items-center">
                <Loader2 size={20} className="animate-spin text-emerald-600" />
              </div>
            )}
          </div>
        </section>

        {/* Results List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {results.length > 0 ? (
              results.map((word, idx) => (
                <motion.div
                  key={`${word.word_roman}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-black/5 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all group"
                >
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight text-emerald-600 uppercase">
                          {word.word_roman}
                          <span className="text-emerald-600/40 ml-2 font-serif text-lg">({word.word_bangla})</span>
                        </h2>
                        <button className="p-1.5 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors">
                          <Volume2 size={16} />
                        </button>
                      </div>
                      <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">
                        {word.category.toLowerCase()}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-black/5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-black text-emerald-700/60 uppercase tracking-tighter shrink-0">EG :</span>
                        <p className="text-sm text-black/80 font-medium">
                          {word.meaning_english}
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-black text-emerald-700/60 uppercase tracking-tighter shrink-0">BG :</span>
                        <p className="text-sm text-black/80 font-medium">
                          {word.meaning_bangla}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : query.trim() !== '' && !isSearching ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 space-y-2 opacity-30"
              >
                <Search size={48} className="mx-auto mb-4" />
                <p className="text-xl font-medium">No results found</p>
                <p className="text-sm">Try a different word or script</p>
              </motion.div>
            ) : query.trim() === '' ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center">
                  <Book size={32} />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-medium">Type to see results</p>
                  <p className="text-sm">Search in Roman, Bangla, or English</p>
                </div>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="flex items-center justify-center gap-4 opacity-20">
          <div className="h-[1px] flex-1 bg-black" />
          <Book size={16} />
          <div className="h-[1px] flex-1 bg-black" />
        </div>
      </footer>
    </div>
  );
}
