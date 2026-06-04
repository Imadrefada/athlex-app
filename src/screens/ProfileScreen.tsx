import { useAthlexStore } from '../store/athlexStore'
import { Flame, Dumbbell, Award, Calendar, Beef, Bot, ChevronRight, Shield, Award as AwardIcon, RotateCcw } from 'lucide-react'

export default function ProfileScreen() {
  const user = useAthlexStore((state) => state.user)
  const workoutHistory = useAthlexStore((state) => state.workoutHistory)
  const achievements = useAthlexStore((state) => state.achievements)
  const resetApp = useAthlexStore((state) => state.resetApp)

  if (!user) return null

  // Calculate stats dynamically
  const workoutsCount = workoutHistory.length
  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length

  // XP Progress math: each level takes 1000 XP
  const nextLevelXpTarget = 1000
  const currentLevelXpProgress = user.xp % 1000
  const xpPercent = Math.min(100, Math.round((currentLevelXpProgress / nextLevelXpTarget) * 100))

  // Map achievement icon strings to Lucide components
  const iconMap: Record<string, any> = {
    Flame: Flame,
    Dumbbell: Dumbbell,
    Calendar: Calendar,
    Award: Award,
    Beef: Beef,
    Bot: Bot
  }

  // Format Goal text
  const getGoalLabel = (goalStr: string) => {
    return goalStr
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  return (
    <div className="flex-1 flex flex-col p-5 overflow-y-auto no-scrollbar bg-bg-main relative text-left pb-24">
      {/* Profile Header Card */}
      <div className="flex flex-col items-center text-center mt-3 bg-surface border border-card rounded-2xl p-5 relative overflow-hidden">
        {/* User Avatar */}
        <div className="w-18 h-18 rounded-full border-2 border-primary/45 bg-surface flex items-center justify-center shadow-lg relative overflow-visible">
          <img 
            src="/assets/user_avatar.png" 
            alt="User Avatar" 
            className="w-full h-full object-cover rounded-full"
          />
          {/* Level Badge */}
          <span className="absolute -bottom-1 -right-1 bg-primary text-white border-2 border-surface font-black text-[9px] w-6 h-6 rounded-full flex items-center justify-center z-10">
            {user.level}
          </span>
        </div>

        <h2 className="text-base font-extrabold text-white mt-3.5 leading-none">{user.name}</h2>
        <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1.5 leading-none">
          Level {user.level} Athlete
        </span>

        {/* XP Progress Bar */}
        <div className="w-full mt-4 flex flex-col gap-1 px-2">
          <div className="flex justify-between text-[9px] font-bold text-gray-400">
            <span>Progress to Next Level</span>
            <span>{currentLevelXpProgress} / {nextLevelXpTarget} XP</span>
          </div>
          <div className="w-full h-1.5 bg-card rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${xpPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-surface border border-card rounded-xl p-3.5 text-center flex flex-col items-center">
          <span className="text-[18px] font-black text-white leading-none">{workoutsCount}</span>
          <span className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Workouts</span>
        </div>
        <div className="bg-surface border border-card rounded-xl p-3.5 text-center flex flex-col items-center">
          <span className="text-[18px] font-black text-white leading-none">{user.streak}</span>
          <span className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Streak Log</span>
        </div>
        <div className="bg-surface border border-card rounded-xl p-3.5 text-center flex flex-col items-center">
          <span className="text-[18px] font-black text-white leading-none">{unlockedAchievementsCount}</span>
          <span className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Awards</span>
        </div>
      </div>

      {/* Options Menu Column */}
      <div className="mt-5 flex flex-col gap-2.5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Settings & Plan</h3>
        
        <div className="bg-surface border border-card rounded-2xl overflow-hidden flex flex-col">
          {[
            { label: 'Goals', desc: getGoalLabel(user.goal), icon: Shield, color: 'text-fat' },
            { label: 'Body Stats', desc: `${user.weight.toFixed(1)} kg • ${user.height} cm`, icon: ScaleIcon, color: 'text-carbs' },
            { label: 'Training Plan', desc: '4 Day Push Pull Legs', icon: Dumbbell, color: 'text-primary' },
            { label: 'Subscription', desc: 'Premium Activated', icon: AwardIcon, color: 'text-warning' }
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="flex items-center justify-between py-3.5 px-4.5 hover:bg-card/45 transition-colors border-b border-card last:border-b-0 cursor-default"
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={item.color} />
                  <div>
                    <span className="text-xs font-bold text-white block leading-none">{item.label}</span>
                    <span className="text-[9px] text-gray-400 font-semibold mt-1 block leading-none">{item.desc}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-500" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Achievements Catalog Grid */}
      <div className="mt-5 flex flex-col gap-2.5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Achievements Catalog</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((item) => {
            const Icon = iconMap[item.icon] || Award
            return (
              <div
                key={item.id}
                className={`border rounded-xl p-3.5 flex flex-col items-center text-center transition-all ${
                  item.unlocked
                    ? 'border-primary/20 bg-surface text-white'
                    : 'border-card bg-surface/40 text-gray-500 opacity-60'
                }`}
              >
                <div className={`p-2.5 rounded-full border mb-2 flex items-center justify-center ${
                  item.unlocked 
                    ? 'bg-primary/10 border-primary/20 text-primary animate-pulse' 
                    : 'bg-card border-card text-gray-500'
                }`}>
                  <Icon size={18} />
                </div>
                <h4 className="text-[10px] font-extrabold text-white leading-tight">{item.title}</h4>
                <p className="text-[9px] text-gray-400 mt-1 leading-tight font-medium">{item.description}</p>
                {item.unlocked && item.unlockedAt && (
                  <span className="text-[8px] text-success font-semibold mt-1.5 leading-none">
                    Unlocked
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Reset System option */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete all local user data and reset the app?")) {
              resetApp()
            }
          }}
          className="flex items-center gap-1.5 py-3 px-6 bg-danger/10 hover:bg-danger/20 border border-danger/25 text-danger font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-md"
        >
          <RotateCcw size={14} />
          <span>Reset App Data</span>
        </button>
      </div>
    </div>
  )
}

// Visual dummy icon fallback
function ScaleIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 16c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2" />
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M12 14v4" />
      <path d="M12 18H8" />
      <path d="M12 18h4" />
    </svg>
  )
}
