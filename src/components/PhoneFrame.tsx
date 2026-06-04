import React from 'react'
import StatusBar from './StatusBar'
import BottomNav from './BottomNav'
import type { TabType } from './BottomNav'
import { Dumbbell, Apple, LineChart, Bot, Award, Shield } from 'lucide-react'

interface PhoneFrameProps {
  children: React.ReactNode
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  showNav: boolean
}

export default function PhoneFrame({ children, activeTab, setActiveTab, showNav }: PhoneFrameProps) {
  return (
    <div className="phone-mockup-wrapper flex items-center justify-center bg-[#05070A] w-full min-h-screen font-sans select-none overflow-hidden">
      {/* Brand Sidebar - Left Column (Visible on Desktop only) */}
      <div className="hidden lg:flex flex-col justify-between w-[320px] h-[855px] pr-8 text-left py-10 select-none animate-fade-in">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-protein flex items-center justify-center text-white font-extrabold text-xl shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              A
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-widest text-white m-0 leading-none">ATHLEX</h1>
              <p className="text-[10px] tracking-widest text-primary font-bold mt-1 uppercase leading-none">Train. Fuel. Progress.</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-6 leading-relaxed">
            All-in-one fitness and nutrition app to build strength, track progress and achieve your goals.
          </p>

          {/* Features Checklist */}
          <div className="mt-8 flex flex-col gap-4 text-xs font-semibold text-gray-400">
            <div className="flex items-center gap-3 transition-colors hover:text-white cursor-default">
              <Dumbbell size={16} className="text-primary" />
              <span>Workout Tracking</span>
            </div>
            <div className="flex items-center gap-3 transition-colors hover:text-white cursor-default">
              <Apple size={16} className="text-carbs" />
              <span>Nutrition Tracking</span>
            </div>
            <div className="flex items-center gap-3 transition-colors hover:text-white cursor-default">
              <LineChart size={16} className="text-primary" />
              <span>Progress Analytics</span>
            </div>
            <div className="flex items-center gap-3 transition-colors hover:text-white cursor-default">
              <Bot size={16} className="text-protein" />
              <span>AI Coaching</span>
            </div>
            <div className="flex items-center gap-3 transition-colors hover:text-white cursor-default">
              <Shield size={16} className="text-fat" />
              <span>Goal Setting</span>
            </div>
            <div className="flex items-center gap-3 transition-colors hover:text-white cursor-default">
              <Award size={16} className="text-warning" />
              <span>Streaks & Achievements</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="text-[10px] text-gray-500 font-medium">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
            <span>Local Database Active</span>
          </div>
          <p>© 2026 ATHLEX Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Interactive Mobile Device Frame */}
      <div className="phone-mockup relative">
        {/* Notch - iPhone speaker and camera layout */}
        <div className="phone-notch"></div>
        
        {/* Interactive side buttons representation (visual only) */}
        <div className="absolute top-[120px] -left-[14px] w-[3px] h-[35px] bg-[#333] rounded-l-[2px]"></div>
        <div className="absolute top-[170px] -left-[14px] w-[3px] h-[50px] bg-[#333] rounded-l-[2px]"></div>
        <div className="absolute top-[230px] -left-[14px] w-[3px] h-[50px] bg-[#333] rounded-l-[2px]"></div>
        <div className="absolute top-[150px] -right-[14px] w-[3px] h-[75px] bg-[#333] rounded-r-[2px]"></div>

        <div className="phone-screen">
          {/* Top Status Bar */}
          <StatusBar />
          
          {/* Main App Content View */}
          <div className="flex-1 overflow-hidden relative flex flex-col bg-[#0D1117]">
            {children}
          </div>

          {/* Bottom Tabs Nav (Conditionally visible) */}
          {showNav && (
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </div>
      </div>
    </div>
  )
}
