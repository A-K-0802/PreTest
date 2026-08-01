'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Check, 
  Tag, 
  Gauge, 
  CheckCircle2
} from 'lucide-react';
import { Difficulty } from '@/types';

export interface FilterState {
  status: 'ALL' | 'SOLVED' | 'TODO';
  difficulty: 'ALL' | Difficulty;
  selectedTags: string[];
  matchMode: 'ALL' | 'ANY';
}

interface ProblemFiltersModalProps {
  availableTags: string[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

export default function ProblemFiltersModal({
  availableTags,
  filters,
  onFilterChange,
  onReset,
}: ProblemFiltersModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount = 
    (filters.status !== 'ALL' ? 1 : 0) +
    (filters.difficulty !== 'ALL' ? 1 : 0) +
    filters.selectedTags.length;

  const toggleTag = (tag: string) => {
    const exists = filters.selectedTags.includes(tag);
    const updatedTags = exists
      ? filters.selectedTags.filter((t) => t !== tag)
      : [...filters.selectedTags, tag];

    onFilterChange({
      ...filters,
      selectedTags: updatedTags,
    });
  };

  return (
    <div className="relative font-mono shrink-0" ref={modalRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-[#131b2e] hover:bg-[#171f33] border px-3 py-2 rounded text-xs font-bold transition-all flex items-center space-x-1.5 h-10 ${
          activeFilterCount > 0 
            ? 'border-[#10b981] text-[#10b981] shadow-md shadow-[#10b981]/10' 
            : 'border-[#3c4a42] text-[#dbe2fd] hover:text-[#10b981]'
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-[#10b981] text-[#0b1326] text-[10px] font-extrabold flex items-center justify-center ml-0.5">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Popover Menu Dropdown — Reduced 30% in size & left-aligned */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-64 sm:w-72 bg-[#131b2e] border border-[#3c4a42] rounded-lg shadow-2xl p-3.5 z-50 space-y-3.5 text-[11px] text-[#dbe2fd]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
            <div className="flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="font-bold text-xs text-[#dbe2fd]">Filter Problems</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#bbcabf] hover:text-[#dbe2fd] transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Match Mode */}
          <div className="flex items-center justify-between bg-[#0b1326] p-2 rounded border border-[#1f2937]">
            <span className="text-[#bbcabf] text-[10px]">Criteria:</span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, matchMode: 'ALL' })}
                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                  filters.matchMode === 'ALL'
                    ? 'bg-[#10b981] text-[#0b1326]'
                    : 'bg-[#131b2e] text-[#bbcabf] hover:text-[#dbe2fd]'
                }`}
              >
                ALL
              </button>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, matchMode: 'ANY' })}
                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                  filters.matchMode === 'ANY'
                    ? 'bg-[#10b981] text-[#0b1326]'
                    : 'bg-[#131b2e] text-[#bbcabf] hover:text-[#dbe2fd]'
                }`}
              >
                ANY
              </button>
            </div>
          </div>

          {/* Row 1: Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#bbcabf] flex items-center gap-1 uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
              Status
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['ALL', 'SOLVED', 'TODO'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, status: st })}
                  className={`py-1 px-1 rounded border text-[10px] font-bold transition-all text-center ${
                    filters.status === st
                      ? 'bg-[#003824] border-[#005236] text-[#10b981]'
                      : 'bg-[#0b1326] border-[#3c4a42] text-[#bbcabf] hover:text-[#dbe2fd]'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'SOLVED' ? 'Solved' : 'Todo'}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Difficulty Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#bbcabf] flex items-center gap-1 uppercase tracking-wider">
              <Gauge className="w-3 h-3 text-[#10b981]" />
              Difficulty
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, difficulty: diff })}
                  className={`py-1 px-1 rounded border text-[9px] font-bold transition-all text-center ${
                    filters.difficulty === diff
                      ? 'bg-[#10b981] border-[#10b981] text-[#0b1326]'
                      : 'bg-[#0b1326] border-[#3c4a42] text-[#bbcabf] hover:text-[#dbe2fd]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Topic Tags (from text[] DB arrays) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-[#bbcabf] flex items-center gap-1 uppercase tracking-wider">
                <Tag className="w-3 h-3 text-[#10b981]" />
                Tags ({availableTags.length})
              </label>
              {filters.selectedTags.length > 0 && (
                <span className="text-[9px] text-[#10b981]">
                  {filters.selectedTags.length} active
                </span>
              )}
            </div>

            <div className="max-h-28 overflow-y-auto pr-1 flex flex-wrap gap-1 p-1.5 bg-[#0b1326] rounded border border-[#1f2937]">
              {availableTags.length === 0 ? (
                <span className="text-[9px] text-[#bbcabf]/50 py-1">No tags</span>
              ) : (
                availableTags.map((tag) => {
                  const isSelected = filters.selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all flex items-center space-x-1 ${
                        isSelected
                          ? 'bg-[#003824] border-[#005236] text-[#10b981]'
                          : 'bg-[#131b2e] border-[#3c4a42] text-[#bbcabf] hover:text-[#dbe2fd]'
                      }`}
                    >
                      <span>{tag}</span>
                      {isSelected && <Check className="w-2.5 h-2.5 ml-0.5" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-[#1f2937] pt-2">
            <button
              type="button"
              onClick={() => {
                onReset();
              }}
              className="text-[#bbcabf] hover:text-[#f87171] text-[10px] flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-[#10b981] hover:bg-[#4edea3] text-[#0b1326] font-bold px-3 py-1 rounded text-[10px] transition-all shadow-md shadow-[#10b981]/20"
            >
              Apply ({activeFilterCount})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
