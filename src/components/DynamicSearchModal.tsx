import { useState, useEffect } from 'react'
import { Search, X, Loader2, Globe, Plus } from 'lucide-react'
import { useAthlexStore } from '../store/athlexStore'
import type { SearchResultFood, SearchResultExercise } from '../store/athlexStore'

interface DynamicSearchModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'food' | 'exercise'
  onAddFood?: (food: Omit<SearchResultFood, 'id' | 'image'>) => void
  onAddExercise?: (exercise: SearchResultExercise) => void
}

export default function DynamicSearchModal({ isOpen, onClose, mode, onAddFood, onAddExercise }: DynamicSearchModalProps) {
  const [query, setQuery] = useState('')
  const { 
    isSearching, 
    searchResultsFood, 
    searchResultsExercise, 
    searchInternetForFood, 
    searchInternetForExercise, 
    clearSearchResults 
  } = useAthlexStore()

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      clearSearchResults()
    }
  }, [isOpen, clearSearchResults])

  if (!isOpen) return null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    if (mode === 'food') {
      searchInternetForFood(query)
    } else {
      searchInternetForExercise(query)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg-main/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-[85vh] bg-surface border-t border-card rounded-t-3xl shadow-2xl flex flex-col animate-slide-up">
        {/* Drag Handle */}
        <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-card rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-4 border-b border-card flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">
              {mode === 'food' ? 'Search Internet for Food' : 'Search Internet for Exercise'}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider flex items-center gap-1">
              <Globe size={10} className="text-primary" />
              Live Web Results
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-card rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-5">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search size={18} className="absolute left-4 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === 'food' ? "e.g. Avocado Toast, 2 Eggs..." : "e.g. Bench Press, Core..."}
              className="w-full bg-bg-main border border-card rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors shadow-inner"
            />
          </form>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto px-5 pb-10 no-scrollbar">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4">
              <Loader2 size={32} className="text-primary animate-spin" />
              <p className="text-xs font-bold text-gray-400 animate-pulse">Scanning the web...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {mode === 'food' && searchResultsFood.map((food) => (
                <div key={food.id} className="bg-bg-main border border-card rounded-2xl p-3 flex gap-4 items-center">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-card">
                    <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">{food.name}</h3>
                    <div className="flex gap-3 mt-1.5 text-[10px] font-semibold text-gray-400">
                      <span className="text-primary">{food.calories} kcal</span>
                      <span className="text-protein">P: {food.protein}g</span>
                      <span className="text-carbs">C: {food.carbs}g</span>
                      <span className="text-fat">F: {food.fat}g</span>
                    </div>
                  </div>

                  {/* Add Button */}
                  <button 
                    onClick={() => {
                      if (onAddFood) {
                        const { id, image, ...foodDataToSave } = food
                        onAddFood(foodDataToSave)
                        onClose()
                      }
                    }}
                    className="w-10 h-10 bg-surface border border-card hover:border-primary hover:bg-primary/10 rounded-xl flex items-center justify-center text-primary transition-colors shrink-0"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ))}

              {mode === 'exercise' && searchResultsExercise.map((ex) => (
                <div key={ex.id} className="bg-bg-main border border-card rounded-2xl p-3 flex gap-4 items-center">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-card relative">
                    <img src={ex.image} alt={ex.name} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-main/80 to-transparent flex items-end justify-center pb-1">
                       <span className="text-[8px] font-black text-white">{ex.muscleTargeted}</span>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white leading-tight">{ex.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2 text-[9px] font-bold">
                      <span className="bg-surface border border-card px-2 py-0.5 rounded text-gray-300">
                        {ex.exerciseType}
                      </span>
                      <span className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-primary">
                        {ex.setsNeeded} Sets × {ex.repsNeeded} Reps
                      </span>
                    </div>
                  </div>

                  {/* Add Button */}
                  <button 
                    onClick={() => {
                      if (onAddExercise) {
                        onAddExercise(ex)
                        onClose()
                      }
                    }}
                    className="w-10 h-10 bg-surface border border-card hover:border-primary hover:bg-primary/10 rounded-xl flex items-center justify-center text-primary transition-colors shrink-0"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ))}

              {!isSearching && searchResultsFood.length === 0 && searchResultsExercise.length === 0 && query !== '' && (
                <div className="text-center text-gray-500 text-xs font-semibold mt-10">
                  Hit Enter to search the web for results.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
