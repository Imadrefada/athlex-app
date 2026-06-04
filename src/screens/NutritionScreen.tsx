import { useState } from 'react'
import { useAthlexStore } from '../store/athlexStore'
import type { MealLogs } from '../store/athlexStore'
import { ChevronLeft, ChevronRight, Plus, Trash2, Utensils } from 'lucide-react'
import DynamicSearchModal from '../components/DynamicSearchModal'

export default function NutritionScreen() {
  const user = useAthlexStore((state) => state.user)
  const nutritionLogs = useAthlexStore((state) => state.nutritionLogs)
  const addFoodToMeal = useAthlexStore((state) => state.addFoodToMeal)
  const removeFoodFromMeal = useAthlexStore((state) => state.removeFoodFromMeal)

  // Timeline State
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  // Log Modal States
  const [showDynamicSearch, setShowDynamicSearch] = useState(false)
  const [activeMealType, setActiveMealType] = useState<keyof MealLogs>('breakfast')

  if (!user) return null

  // Helpers to navigate selected date
  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  // Get active day logs
  const activeLogs = nutritionLogs[selectedDate] || { breakfast: [], lunch: [], dinner: [], snacks: [] }

  // Sum active nutrients
  const sumNutrients = (key: 'calories' | 'protein' | 'carbs' | 'fat') => {
    return ['breakfast', 'lunch', 'dinner', 'snacks'].reduce((sum, type) => {
      const items = activeLogs[type as keyof MealLogs] || []
      return sum + items.reduce((s, item) => s + item[key], 0)
    }, 0)
  }

  const consumedCal = sumNutrients('calories')
  const consumedProtein = sumNutrients('protein')
  const consumedCarbs = sumNutrients('carbs')
  const consumedFat = sumNutrients('fat')

  const remainingCal = Math.max(0, user.calorieTarget - consumedCal)



  const triggerAddFoodModal = (mealType: keyof MealLogs) => {
    setActiveMealType(mealType)
    setShowDynamicSearch(true)
  }

  const getMealTotalCalories = (mealType: keyof MealLogs) => {
    return (activeLogs[mealType] || []).reduce((sum, item) => sum + item.calories, 0)
  }

  // Format Date for Header display
  const formatDateHeader = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    if (selectedDate === todayStr) return 'Today'
    
    const d = new Date(selectedDate)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
  }

  // Define weekdays list for top timeline slider
  const getTimelineDays = () => {
    const current = new Date(selectedDate)
    const week = []
    // Get start of week (Sunday or Monday, let's offset by 3 days behind and 3 ahead)
    for (let i = -3; i <= 3; i++) {
      const d = new Date(current)
      d.setDate(current.getDate() + i)
      week.push({
        dateStr: d.toISOString().split('T')[0],
        dayLetter: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNum: d.getDate()
      })
    }
    return week
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-main relative overflow-hidden text-left h-full">
      {/* Dynamic Search Modal */}
      <DynamicSearchModal
        isOpen={showDynamicSearch}
        onClose={() => setShowDynamicSearch(false)}
        mode="food"
        onAddFood={(foodData) => {
          addFoodToMeal(selectedDate, activeMealType, foodData as any)
        }}
      />

      {/* Timeline calendar header */}
      <div className="bg-surface/50 border-b border-surface/50 px-5 pt-3 pb-3">
        <div className="flex justify-between items-center">
          <button 
            onClick={handlePrevDay} 
            className="p-1 hover:bg-card border border-transparent hover:border-gray-800 rounded-lg text-gray-400 hover:text-white cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          
          <h2 className="text-sm font-extrabold text-white">{formatDateHeader()}</h2>
          
          <button 
            onClick={handleNextDay} 
            className="p-1 hover:bg-card border border-transparent hover:border-gray-800 rounded-lg text-gray-400 hover:text-white cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Days letters row */}
        <div className="flex justify-between mt-4">
          {getTimelineDays().map((day) => {
            const isSelected = day.dateStr === selectedDate
            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={`flex flex-col items-center gap-1.5 w-9 py-2.5 rounded-full transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-primary text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]' 
                    : 'hover:bg-surface/80 text-gray-400'
                }`}
              >
                <span className="text-[9px] uppercase font-bold leading-none">{day.dayLetter}</span>
                <span className="text-xs font-black leading-none">{day.dayNum}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main logging area list */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 pb-32 flex flex-col gap-4">
        {/* Remaining Calories Widget */}
        <div className="bg-surface border border-card rounded-2xl p-4.5 flex justify-between items-center">
          <div>
            <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Calories Target</h4>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-xl font-black text-white leading-none">{consumedCal}</span>
              <span className="text-[10px] text-gray-500 font-bold">/ {user.calorieTarget} kcal</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`w-2 h-2 rounded-full ${remainingCal > 0 ? 'bg-success animate-pulse' : 'bg-danger'}`}></span>
              <span className="text-[10px] text-gray-400 font-semibold">{remainingCal} kcal remaining</span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col items-center bg-card border border-gray-700/60 p-2.5 rounded-xl min-w-[50px] text-center">
              <span className="text-[9px] text-protein font-extrabold uppercase">Prot</span>
              <span className="text-xs font-bold text-white mt-1">{consumedProtein}g</span>
            </div>
            <div className="flex flex-col items-center bg-card border border-gray-700/60 p-2.5 rounded-xl min-w-[50px] text-center">
              <span className="text-[9px] text-carbs font-extrabold uppercase">Carb</span>
              <span className="text-xs font-bold text-white mt-1">{consumedCarbs}g</span>
            </div>
            <div className="flex flex-col items-center bg-card border border-gray-700/60 p-2.5 rounded-xl min-w-[50px] text-center">
              <span className="text-[9px] text-fat font-extrabold uppercase">Fat</span>
              <span className="text-xs font-bold text-white mt-1">{consumedFat}g</span>
            </div>
          </div>
        </div>

        {/* Meal cards logging categories */}
        {['breakfast', 'lunch', 'dinner', 'snacks'].map((type) => {
          const mType = type as keyof MealLogs
          const items = activeLogs[mType] || []
          const totalCal = getMealTotalCalories(mType)
          
          return (
            <div key={type} className="bg-surface border border-card rounded-2xl p-4 flex flex-col gap-3">
              {/* Card Header */}
              <div className="flex justify-between items-center pb-2 border-b border-card/45">
                <div>
                  <h3 className="text-sm font-extrabold text-white capitalize leading-none">{type}</h3>
                  <span className="text-[9px] text-gray-500 font-bold mt-1 block">Total Consumed</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-gray-300">{totalCal} kcal</span>
                  <button
                    onClick={() => triggerAddFoodModal(mType)}
                    className="p-1.5 bg-primary/10 border border-primary/20 text-primary hover:text-white hover:bg-primary rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-2">
                {items.map((food) => (
                  <div 
                    key={food.id} 
                    className="flex justify-between items-center bg-card/40 border border-card/60 p-2.5 rounded-xl animate-fade-in hover:border-gray-700 transition-colors"
                  >
                    <div className="flex-1 pr-4 flex items-center gap-3">
                      {(food as any).image && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-card/60">
                          <img src={(food as any).image} alt={food.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{food.name}</h4>
                        <p className="text-[9px] text-gray-400 font-semibold mt-0.5">
                          {food.weight}g • P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-white">{food.calories} kcal</span>
                      <button
                        onClick={() => removeFoodFromMeal(selectedDate, mType, food.id)}
                        className="text-gray-500 hover:text-danger p-1 rounded-lg hover:bg-card transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {items.length === 0 && (
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 py-1 font-semibold leading-none pl-1">
                    <Utensils size={12} />
                    <span>No food entries logged for {type}.</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
