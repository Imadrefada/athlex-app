import { useAthlexStore } from '../store/athlexStore'
import type { MealLogs } from '../store/athlexStore'
import { Flame, Bell, Dumbbell, ArrowUpRight, Scale, ChevronRight } from 'lucide-react'
import type { TabType } from '../components/BottomNav'

interface HomeScreenProps {
  setActiveTab: (tab: TabType) => void
}

export default function HomeScreen({ setActiveTab }: HomeScreenProps) {
  const user = useAthlexStore((state) => state.user)
  const nutritionLogs = useAthlexStore((state) => state.nutritionLogs)
  const weightLogs = useAthlexStore((state) => state.weightLogs)
  const activeWorkout = useAthlexStore((state) => state.activeWorkout)
  const startWorkout = useAthlexStore((state) => state.startWorkout)

  if (!user) return null

  // Calculate today's numbers
  const todayStr = new Date().toISOString().split('T')[0]
  const todayNutrition = nutritionLogs[todayStr] || { breakfast: [], lunch: [], dinner: [], snacks: [] }

  const sumNutrients = (key: 'calories' | 'protein' | 'carbs' | 'fat') => {
    return ['breakfast', 'lunch', 'dinner', 'snacks'].reduce((sum, type) => {
      const items = todayNutrition[type as keyof MealLogs] || []
      return sum + items.reduce((s, item) => s + item[key], 0)
    }, 0)
  }

  const consumedCal = sumNutrients('calories')
  const consumedProtein = sumNutrients('protein')
  const consumedCarbs = sumNutrients('carbs')
  const consumedFat = sumNutrients('fat')

  // Calorie ring progress
  const calPercent = Math.min(100, Math.round((consumedCal / user.calorieTarget) * 100))
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (calPercent / 100) * circumference

  // Macro percentages
  const pPercent = Math.min(100, Math.round((consumedProtein / user.proteinTarget) * 100))
  const cPercent = Math.min(100, Math.round((consumedCarbs / user.carbsTarget) * 100))
  const fPercent = Math.min(100, Math.round((consumedFat / user.fatTarget) * 100))

  // Recent weight history for mini SVG graph (last 7 logs)
  const recentWeightLogs = weightLogs.slice(-7)
  const currentWeight = user.weight
  
  // Calculate weight change this month
  let monthlyChangeText = '-0.8 kg this month'
  if (weightLogs.length > 1) {
    const firstWeight = weightLogs[0].weight
    const diff = currentWeight - firstWeight
    monthlyChangeText = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)} kg this month`
  }

  // Draw weight mini SVG graph path
  let miniSvgPath = ''
  if (recentWeightLogs.length > 1) {
    const minW = Math.min(...recentWeightLogs.map(l => l.weight)) - 0.5
    const maxW = Math.max(...recentWeightLogs.map(l => l.weight)) + 0.5
    const range = maxW - minW || 1
    
    const width = 120
    const height = 30
    const points = recentWeightLogs.map((log, index) => {
      const x = (index / (recentWeightLogs.length - 1)) * width
      const y = height - ((log.weight - minW) / range) * height
      return `${x},${y}`
    })
    miniSvgPath = `M ${points.join(' L ')}`
  }

  // Calculate exercises completed for today's workout card
  let workoutProgressText = '0/3 exercises completed'
  if (activeWorkout) {
    const completedCount = activeWorkout.exercises.filter(ex => 
      ex.sets.length > 0 && ex.sets.every(s => s.completed)
    ).length
    workoutProgressText = `${completedCount}/${activeWorkout.exercises.length} exercises completed`
  }

  const handleWorkoutAction = () => {
    if (!activeWorkout) {
      startWorkout('Push Day')
    }
    setActiveTab('workout')
  }

  return (
    <div className="flex-1 flex flex-col p-5 overflow-y-auto no-scrollbar animate-fade-in text-left pb-24">
      {/* Header Notification & Streak */}
      <div className="flex justify-between items-center mt-3">
        <div>
          <h4 className="text-xs text-gray-400 font-bold tracking-wide leading-none">Good Evening,</h4>
          <h2 className="text-xl font-extrabold text-white mt-1 leading-none">{user.name} 👋</h2>
          <div className="flex items-center gap-1 mt-2.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1 w-max">
            <Flame size={12} className="text-primary animate-pulse" />
            <span className="text-[10px] text-primary font-bold">Day {user.streak} Streak</span>
          </div>
        </div>
        
        {/* Notification Badge */}
        <div className="relative p-2 bg-surface rounded-full border border-card/85 text-gray-300 hover:text-white cursor-pointer transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-surface"></span>
        </div>
      </div>

      {/* Calories Overview Wheel */}
      <div className="mt-6 bg-surface border border-card rounded-2xl p-5 flex items-center justify-between">
        {/* SVG Ring */}
        <div className="relative w-[140px] h-[140px]">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="stroke-card"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="stroke-primary transition-all duration-500 ease-out"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Inner Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-white tracking-tight leading-none">
              {consumedCal.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-400 font-semibold mt-1">
              / {user.calorieTarget} kcal
            </span>
          </div>
        </div>

        {/* Quick Nutrition Summary Side info */}
        <div className="flex-1 pl-6 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-400">Calories remaining:</span>
            <span className="text-white">
              {Math.max(0, user.calorieTarget - consumedCal)} kcal
            </span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            {/* Protein bar */}
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-protein">Protein</span>
                <span className="text-white">{consumedProtein}g / {user.proteinTarget}g</span>
              </div>
              <div className="w-full h-1.5 bg-card rounded-full overflow-hidden">
                <div className="h-full bg-protein rounded-full" style={{ width: `${pPercent}%` }}></div>
              </div>
            </div>
            {/* Carbs bar */}
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-carbs">Carbs</span>
                <span className="text-white">{consumedCarbs}g / {user.carbsTarget}g</span>
              </div>
              <div className="w-full h-1.5 bg-card rounded-full overflow-hidden">
                <div className="h-full bg-carbs rounded-full" style={{ width: `${cPercent}%` }}></div>
              </div>
            </div>
            {/* Fat bar */}
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-fat">Fat</span>
                <span className="text-white">{consumedFat}g / {user.fatTarget}g</span>
              </div>
              <div className="w-full h-1.5 bg-card rounded-full overflow-hidden">
                <div className="h-full bg-fat rounded-full" style={{ width: `${fPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Workout Widget */}
      <div className="mt-4 border border-card rounded-2xl p-4.5 flex flex-col gap-4 relative overflow-hidden shadow-premium">
        {/* Cinematic Dumbbell Background */}
        <img 
          src="/assets/workout_banner.png" 
          alt="Workout" 
          className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/60 to-transparent"></div>

        <div className="flex justify-between items-start relative z-10">
          <div>
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">Today's Workout</h4>
            <h3 className="text-lg font-extrabold text-white mt-1 leading-tight">
              {activeWorkout ? activeWorkout.name : 'Push Day'}
            </h3>
            <p className="text-[11px] text-gray-300 font-semibold mt-1">{workoutProgressText}</p>
          </div>
          <div className="p-3 bg-primary/20 border border-primary/30 text-primary rounded-xl backdrop-blur-xs">
            <Dumbbell size={20} />
          </div>
        </div>

        <button
          onClick={handleWorkoutAction}
          className="w-full py-3 bg-primary hover:bg-primary-dark transition-all rounded-xl text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(59,130,246,0.25)] active:scale-[0.98] relative z-10"
        >
          <span>{activeWorkout ? 'Resume Workout' : 'Start Workout'}</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Macronutrient Breakdowns detailed cards */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-surface border border-card rounded-xl p-3 flex flex-col">
          <span className="text-[10px] text-protein font-extrabold uppercase">Protein</span>
          <span className="text-sm font-extrabold text-white mt-1.5 leading-none">{consumedProtein}g</span>
          <span className="text-[9px] text-gray-400 font-bold mt-1">/ {user.proteinTarget}g</span>
        </div>
        <div className="bg-surface border border-card rounded-xl p-3 flex flex-col">
          <span className="text-[10px] text-carbs font-extrabold uppercase">Carbs</span>
          <span className="text-sm font-extrabold text-white mt-1.5 leading-none">{consumedCarbs}g</span>
          <span className="text-[9px] text-gray-400 font-bold mt-1">/ {user.carbsTarget}g</span>
        </div>
        <div className="bg-surface border border-card rounded-xl p-3 flex flex-col">
          <span className="text-[10px] text-fat font-extrabold uppercase">Fat</span>
          <span className="text-sm font-extrabold text-white mt-1.5 leading-none">{consumedFat}g</span>
          <span className="text-[9px] text-gray-400 font-bold mt-1">/ {user.fatTarget}g</span>
        </div>
      </div>

      {/* Weight Log Widget with Mini SVG Trend */}
      <button 
        onClick={() => setActiveTab('progress')}
        className="mt-4 bg-surface border border-card hover:border-gray-700 transition-colors rounded-2xl p-4.5 flex items-center justify-between cursor-pointer w-full text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-card border border-gray-700 text-gray-300 rounded-xl">
            <Scale size={18} />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Weight</h4>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-lg font-black text-white leading-none">{currentWeight.toFixed(1)}</span>
              <span className="text-xs text-gray-400 font-bold">kg</span>
            </div>
            <p className="text-[10px] text-success font-bold mt-1 leading-none">{monthlyChangeText}</p>
          </div>
        </div>

        {/* Mini SVG Graph */}
        {miniSvgPath && (
          <div className="h-8 flex items-center pr-2">
            <svg width="120" height="30">
              {/* Path line */}
              <path
                d={miniSvgPath}
                fill="none"
                className="stroke-primary"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Endpoint glow dot */}
              {recentWeightLogs.length > 0 && (() => {
                const minW = Math.min(...recentWeightLogs.map(l => l.weight)) - 0.5
                const maxW = Math.max(...recentWeightLogs.map(l => l.weight)) + 0.5
                const range = maxW - minW || 1
                const x = 120
                const y = 30 - ((recentWeightLogs[recentWeightLogs.length - 1].weight - minW) / range) * 30
                return (
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    className="fill-primary"
                  />
                )
              })()}
            </svg>
          </div>
        )}

        <ChevronRight size={16} className="text-gray-500" />
      </button>
    </div>
  )
}
