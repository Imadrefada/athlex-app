import { useState } from 'react'
import { useAthlexStore } from './store/athlexStore'
import PhoneFrame from './components/PhoneFrame'
import type { TabType } from './components/BottomNav'

// Screens
import OnboardingScreen from './screens/OnboardingScreen'
import HomeScreen from './screens/HomeScreen'
import WorkoutScreen from './screens/WorkoutScreen'
import NutritionScreen from './screens/NutritionScreen'
import ScannerScreen from './screens/ScannerScreen'
import CoachScreen from './screens/CoachScreen'
import ProfileScreen from './screens/ProfileScreen'
import ProgressScreen from './screens/ProgressScreen'

export default function App() {
  const user = useAthlexStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<TabType>('home')

  // Scanner redirect handler state
  const [showScanner, setShowScanner] = useState(false)

  // Custom Navigation Active screen router
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen setActiveTab={setActiveTab} />
      case 'workout':
        return <WorkoutScreen />
      case 'nutrition':
        // If the user wants to scan food, we display the scanner viewfinder
        if (showScanner) {
          return <ScannerScreen setActiveTab={(tab) => {
            setShowScanner(false)
            setActiveTab(tab)
          }} />
        }
        return (
          <div className="flex-grow flex flex-col relative overflow-hidden h-full">
            <NutritionScreen />
            {/* Quick floating Camera button to launch AI Scanner screen */}
            <button
              onClick={() => setShowScanner(true)}
              className="absolute bottom-20 right-5 w-12 h-12 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.4)] cursor-pointer hover:scale-105 active:scale-95 transition-all z-40 border border-primary/20"
              title="Open AI Food Scanner"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </button>
          </div>
        )
      case 'progress':
        return <ProgressScreen />
      case 'coach':
        return <CoachScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <HomeScreen setActiveTab={setActiveTab} />
    }
  }

  // If no user exists, display onboarding flow
  if (!user) {
    return (
      <PhoneFrame activeTab={activeTab} setActiveTab={setActiveTab} showNav={false}>
        <OnboardingScreen />
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame activeTab={activeTab} setActiveTab={setActiveTab} showNav={!showScanner}>
      {renderScreen()}
    </PhoneFrame>
  )
}
