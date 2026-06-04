import { useState, useEffect, useRef } from 'react'
import { useAthlexStore } from '../store/athlexStore'
import { Send, Bot, BarChart2 } from 'lucide-react'

export default function CoachScreen() {
  const chatMessages = useAthlexStore((state) => state.chatMessages)
  const sendMessageToCoach = useAthlexStore((state) => state.sendMessageToCoach)
  
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages, isTyping])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const text = inputText
    setInputText('')
    sendMessageToCoach(text)
    
    // Trigger typing state simulation
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  // Preloaded suggest prompts for quick clicking
  const quickPrompts = [
    { label: 'Suggest Protein foods 🍗', text: 'Recommend high protein foods' },
    { label: 'Check calories targets 📊', text: 'How many calories should I eat?' },
    { label: 'Improve Bench Press 🏋️', text: 'Tips to improve my Bench Press' }
  ]

  return (
    <div className="flex-1 flex flex-col bg-bg-main relative text-left h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-4 pb-3.5 bg-surface/50 border-b border-surface/50 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-protein/10 border border-protein/25 flex items-center justify-center text-protein">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white leading-none">AI Coach</h2>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mt-1">Smart Advisor v1.0</span>
          </div>
        </div>
      </div>

      {/* Messages Stream Container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 no-scrollbar flex flex-col gap-4 pb-32"
      >
        {chatMessages.map((msg) => {
          const isCoach = msg.sender === 'coach'
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                isCoach ? 'self-start' : 'self-end flex-row-reverse'
              }`}
            >
              {/* Avatar Icon */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-card select-none">
                {isCoach ? (
                  <img src="/assets/ai_coach_hologram.png" alt="Coach AI" className="w-full h-full object-cover" />
                ) : (
                  <img src="/assets/user_avatar.png" alt="User avatar" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Message Content Bubble */}
              <div className="flex flex-col gap-1">
                <div className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed border ${
                  isCoach 
                    ? 'bg-surface border-card text-gray-200 rounded-tl-sm' 
                    : 'bg-primary border-primary/20 text-white rounded-tr-sm shadow-[0_3px_10px_rgba(59,130,246,0.15)]'
                }`}>
                  {msg.text}
                </div>

                {/* Optional Weekly Report Summary card bubble */}
                {isCoach && msg.isReport && msg.reportData && (
                  <div className="bg-surface border border-card rounded-2xl p-4 mt-2 flex flex-col gap-3.5 max-w-[280px] animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-card/45">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <BarChart2 size={14} className="text-protein" />
                        <span>Weekly Summary</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-gray-400">
                      <div className="bg-card/40 border border-card p-2 rounded-xl">
                        <span>Workouts</span>
                        <span className="block text-xs font-black text-white mt-1">{msg.reportData.workouts}</span>
                      </div>
                      <div className="bg-card/40 border border-card p-2 rounded-xl">
                        <span>Calories burned</span>
                        <span className="block text-xs font-black text-white mt-1">{msg.reportData.caloriesBurned} kcal</span>
                      </div>
                      <div className="bg-card/40 border border-card p-2 rounded-xl">
                        <span>Avg. Protein</span>
                        <span className="block text-xs font-black text-white mt-1">{msg.reportData.avgProtein}g</span>
                      </div>
                      <div className="bg-card/40 border border-card p-2 rounded-xl">
                        <span>Weight Change</span>
                        <span className="block text-xs font-black text-success mt-1">{msg.reportData.weightChange} kg</span>
                      </div>
                    </div>

                    <button className="w-full py-2 bg-card hover:bg-gray-700 border border-gray-700/80 transition-colors font-bold text-[9px] text-gray-300 rounded-lg text-center">
                      View Full Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Dynamic typing loader bubble */}
        {isTyping && (
          <div className="flex gap-3 max-w-[85%] self-start animate-fade-in">
            <div className="w-8 h-8 rounded-full border border-card overflow-hidden shrink-0">
              <img src="/assets/ai_coach_hologram.png" alt="Coach AI" className="w-full h-full object-cover" />
            </div>
            <div className="bg-surface border border-card p-3 rounded-2xl rounded-tl-sm text-gray-400 text-xs flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-typing"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-typing [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-typing [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick clicks bar and Message input form */}
      <div className="absolute bottom-0 left-0 right-0 p-4.5 bg-gradient-to-t from-bg-main via-bg-main to-transparent border-t border-card/25 flex flex-col gap-3">
        {/* Quick prompt slider */}
        {chatMessages.length <= 3 && !isTyping && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 select-none">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(p.text)
                }}
                className="bg-surface hover:bg-card border border-card hover:border-gray-700 rounded-full px-3 py-1.5 text-[9px] font-bold text-gray-300 hover:text-white whitespace-nowrap cursor-pointer transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Message Input form */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask anything..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-surface border border-card rounded-2xl px-4 py-3 text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-protein"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 bg-primary hover:bg-primary-dark transition-colors text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={15} />
          </button>
        </form>
        <span className="text-[8px] text-gray-500 font-bold text-center leading-none">
          AI can make mistakes. Consider checking important information.
        </span>
      </div>
    </div>
  )
}
