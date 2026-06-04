import { Home, Dumbbell, Apple, TrendingUp, Bot, User } from 'lucide-react'

export type TabType = 'home' | 'workout' | 'nutrition' | 'progress' | 'coach' | 'profile'

interface BottomNavProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'coach', label: 'Coach', icon: Bot },
    { id: 'profile', label: 'Profile', icon: User }
  ]

  return (
    <div className="flex justify-around items-center bg-surface border-t border-card/60 pb-5 pt-2 px-2 select-none z-50 text-[10px] text-gray-400 font-semibold h-[70px]">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-200 cursor-pointer ${
              isActive ? 'text-primary scale-105' : 'hover:text-white text-gray-400'
            }`}
          >
            <div className="relative flex items-center justify-center p-1 rounded-xl transition-all duration-300">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="absolute -bottom-1.5 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#3b82f6]"></span>
              )}
            </div>
            <span className="text-[10px] tracking-wide font-medium">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
