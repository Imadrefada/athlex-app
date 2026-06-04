import { useState, useEffect, useRef } from 'react'
import { useAthlexStore } from '../store/athlexStore'
import { Dumbbell, Plus, Clock, Check, Play, Pause, RefreshCw, X, Award, HelpCircle, Eye, Search, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import DynamicSearchModal from '../components/DynamicSearchModal'

export default function WorkoutScreen() {
  const activeWorkout = useAthlexStore((state) => state.activeWorkout)
  const startWorkout = useAthlexStore((state) => state.startWorkout)
  const toggleSetCompletion = useAthlexStore((state) => state.toggleSetCompletion)
  const updateSetDetails = useAthlexStore((state) => state.updateSetDetails)
  const addSetToExercise = useAthlexStore((state) => state.addSetToExercise)
  const cancelWorkout = useAthlexStore((state) => state.cancelWorkout)
  const completeWorkout = useAthlexStore((state) => state.completeWorkout)
  const startCustomWorkout = useAthlexStore((state) => state.startCustomWorkout)
  const exerciseDb = useAthlexStore((state) => state.exerciseDatabase)

  const [activeExerciseId, setActiveExerciseId] = useState<string>('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  
  // Rest Timer States
  const [timerSeconds, setTimerSeconds] = useState(120) // default 2 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timerIntervalRef = useRef<any>(null)

  // Web Audio Beeper for timer completion
  const playTimerBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime) // Pitch: A5 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    } catch (err) {
      console.warn("AudioContext block by browser auto-play policy: ", err)
    }
  }

  // Timer countdown hook
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            playTimerBeep()
            clearInterval(timerIntervalRef.current)
            return 120
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [isTimerRunning])

  // Select first exercise when a workout is started
  useEffect(() => {
    if (activeWorkout && activeWorkout.exercises.length > 0 && !activeExerciseId) {
      setActiveExerciseId(activeWorkout.exercises[0].id)
    }
  }, [activeWorkout, activeExerciseId])

  // Triggers timer on checking set completed
  const handleToggleSet = (exerciseId: string, setIdx: number, wasCompleted: boolean) => {
    toggleSetCompletion(exerciseId, setIdx)
    // If completing the set, trigger the rest timer
    if (!wasCompleted) {
      setTimerSeconds(120)
      setIsTimerRunning(true)
    }
  }

  const handleCompleteWorkout = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    })
    completeWorkout()
    setShowWorkoutSummary(true)
    setIsTimerRunning(false)
  }

  // Format Timer text
  const formatTimerText = () => {
    const mins = Math.floor(timerSeconds / 60)
    const secs = timerSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // getWorkoutSummaryStats was removed to fix unused warning

  // Screen 1: Routine Selection (If workout is NOT active)
  if (!activeWorkout) {
    return (
      <div className="flex-1 flex flex-col p-5 overflow-y-auto no-scrollbar animate-fade-in text-left pb-24">
        <DynamicSearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          mode="exercise"
          onAddExercise={(ex) => {
            startCustomWorkout(ex)
          }}
        />
        {/* Active workout receipt overlay modal */}
        {showWorkoutSummary && (
          <div className="absolute inset-0 bg-bg-main/95 z-50 flex flex-col justify-center items-center p-6 animate-fade-in">
            <div className="bg-surface border border-card p-6 rounded-3xl w-full max-w-sm text-center relative">
              <div className="w-16 h-16 bg-success/15 border border-success/35 text-success rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Award size={32} />
              </div>
              <h2 className="text-xl font-extrabold text-white">Workout Complete!</h2>
              <p className="text-xs text-gray-400 mt-1">Excellent training session logged.</p>
              
              <div className="grid grid-cols-2 gap-3 my-6">
                <div className="bg-card border border-gray-700/60 p-3.5 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">XP Gained</span>
                  <span className="text-lg font-extrabold text-primary">+50 XP</span>
                </div>
                <div className="bg-card border border-gray-700/60 p-3.5 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Streak Log</span>
                  <span className="text-lg font-extrabold text-success">Active 🔥</span>
                </div>
              </div>

              <button
                onClick={() => setShowWorkoutSummary(false)}
                className="w-full py-3 bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h2 className="text-2xl font-extrabold text-white">Start Workout</h2>
          <p className="text-xs text-gray-400 mt-1">Select a program routine below to begin tracking.</p>
        </div>

        {/* Workout list */}
        <div className="mt-8 flex flex-col gap-4">
          {/* Push Routine */}
          <div className="bg-surface border border-card rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
            <div>
              <h3 className="text-lg font-extrabold text-white leading-none">Push Day</h3>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">Focus: Chest, Shoulders, Triceps</p>
              <div className="mt-3 flex gap-2 text-[10px] text-primary font-bold">
                <span className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Bench Press</span>
                <span className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Dumbbell Press</span>
                <span className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Lateral Raise</span>
              </div>
            </div>
            <button
              onClick={() => startWorkout('Push Day')}
              className="py-3 bg-primary hover:bg-primary-dark transition-colors font-bold text-xs text-white rounded-xl text-center cursor-pointer shadow-[0_4px_12px_rgba(59,130,246,0.25)]"
            >
              Start Push Routine
            </button>
          </div>

          {/* Pull Routine */}
          <div className="bg-surface border border-card rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
            <div>
              <h3 className="text-lg font-extrabold text-white leading-none">Pull Day</h3>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">Focus: Back, Biceps, Core</p>
              <div className="mt-3 flex gap-2 text-[10px] text-protein font-bold">
                <span className="bg-protein/10 border border-protein/20 px-2 py-0.5 rounded-full">Pull-ups</span>
                <span className="bg-protein/10 border border-protein/20 px-2 py-0.5 rounded-full">Deadlifts</span>
              </div>
            </div>
            <button
              onClick={() => startWorkout('Pull Day')}
              className="py-3 bg-surface border border-card hover:border-gray-700 transition-colors font-bold text-xs text-gray-300 rounded-xl text-center cursor-pointer"
            >
              Start Pull Routine
            </button>
          </div>

          {/* AI Generator Routine */}
          <div className="bg-surface border border-primary/30 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden mt-2 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-extrabold text-white leading-none">AI Smart Routine</h3>
                <span className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">New</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">Auto-generate a 45 min muscle-building session optimized for you.</p>
            </div>
            <button
              onClick={() => useAthlexStore.getState().startAIWorkout('Build Muscle', 45, 'Full Gym')}
              className="py-3 bg-gradient-to-r from-primary to-primary-dark hover:brightness-110 transition-all font-bold text-xs text-white flex items-center justify-center gap-2 rounded-xl text-center cursor-pointer shadow-lg"
            >
              <Sparkles size={14} />
              Generate AI Workout
            </button>
          </div>

          {/* Custom Web Search Routine */}
          <div className="bg-surface border border-card rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden mt-2">
            <div>
              <h3 className="text-lg font-extrabold text-white leading-none">Custom Web Search</h3>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">Search the internet for specific exercises to add.</p>
            </div>
            <button
              onClick={() => setShowSearchModal(true)}
              className="py-3 bg-surface border border-primary hover:bg-primary/10 transition-colors font-bold text-xs text-primary flex items-center justify-center gap-2 rounded-xl text-center cursor-pointer"
            >
              <Search size={14} />
              Search Web Database
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Active workout states retrieval
  const activeEx = activeWorkout.exercises.find(e => e.id === activeExerciseId) || activeWorkout.exercises[0]
  const dbEx = exerciseDb.find(e => e.id === activeEx.id) || { name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', instructions: [] }

  return (
    <div className="flex-1 flex flex-col bg-bg-main relative overflow-hidden text-left h-full">
      {/* Exercise Instructions Overlay */}
      {showInstructions && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-surface border border-card p-5 rounded-2xl w-full max-w-sm flex flex-col max-h-[70%]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-white text-base">Instructions: {dbEx.name}</h3>
              <button 
                onClick={() => setShowInstructions(false)}
                className="p-1 hover:bg-card rounded-full text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar text-xs text-gray-300 leading-relaxed pr-1 flex flex-col gap-2">
              {dbEx.instructions.map((stepStr, idx) => (
                <div key={idx} className="flex gap-2 bg-card/40 border border-card p-2 rounded-lg">
                  <span className="font-bold text-primary">{idx + 1}.</span>
                  <span>{stepStr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Header - Session controls */}
      <div className="flex justify-between items-center px-5 pt-4 pb-2 bg-surface/50 border-b border-surface/50">
        <div>
          <h3 className="text-sm font-bold text-primary">{activeWorkout.name}</h3>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Active Track Session</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cancelWorkout}
            className="px-3 py-1.5 bg-danger/10 border border-danger/25 text-danger font-bold text-[10px] rounded-lg cursor-pointer hover:bg-danger/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCompleteWorkout}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold text-[10px] rounded-lg cursor-pointer shadow-[0_0_8px_#3b82f6] transition-colors"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Tabs of Exercises */}
      <div className="flex gap-2 px-5 py-3 border-b border-card/40 overflow-x-auto no-scrollbar bg-surface/20">
        {activeWorkout.exercises.map((ex) => {
          const isSelected = ex.id === activeExerciseId
          const completedCount = ex.sets.filter(s => s.completed).length
          const isDone = ex.sets.length > 0 && ex.sets.every(s => s.completed)
          
          return (
            <button
              key={ex.id}
              onClick={() => setActiveExerciseId(ex.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/10 text-white'
                  : isDone
                    ? 'border-success/30 bg-success/5 text-success/80'
                    : 'border-card bg-surface/60 text-gray-400'
              }`}
            >
              <span>{ex.name}</span>
              {completedCount > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-primary/20 text-white' : 'bg-card text-gray-500'}`}>
                  {completedCount}/{ex.sets.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Exercise Active Screen */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 pb-32">
        {/* Workout Graphic & Labels */}
        <div className="bg-surface border border-card rounded-2xl p-4 flex gap-4 items-center mb-4 shadow-sm">
          <div className="w-16 h-16 bg-card border border-gray-700/60 rounded-xl flex items-center justify-center text-primary overflow-hidden shrink-0">
            {activeEx.id === '1' ? (
              <img 
                src="/assets/bench_press_illustration.png" 
                alt="Bench Press" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Dumbbell size={28} />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-base font-extrabold text-white">{activeEx.name}</h2>
            <p className="text-[10px] text-gray-400 mt-1 font-semibold uppercase tracking-wider">
              {dbEx.muscleGroup} • {dbEx.equipment}
            </p>
            
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-1 text-[9px] text-gray-400 font-bold bg-card border border-gray-700 px-2.5 py-1 rounded-lg hover:text-white"
              >
                <HelpCircle size={10} />
                <span>Instructions</span>
              </button>
              <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold bg-card border border-gray-700 px-2.5 py-1 rounded-lg">
                <Eye size={10} />
                <span>Muscle Map</span>
              </div>
            </div>
          </div>
        </div>

        {/* Working Sets Header */}
        <div className="flex justify-between items-center mb-2 px-1">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Working Sets</h4>
          <button
            onClick={() => addSetToExercise(activeEx.id)}
            className="flex items-center gap-1 text-[10px] text-primary font-bold hover:underline cursor-pointer"
          >
            <Plus size={12} />
            <span>Add Set</span>
          </button>
        </div>

        {/* Sets Tracker Grid */}
        <div className="flex flex-col gap-2.5">
          {/* Header Row */}
          <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-gray-500 text-center uppercase tracking-wider px-1">
            <span>Set</span>
            <span>Weight (kg)</span>
            <span>Reps</span>
            <span>Log</span>
          </div>

          {/* Sets Data List */}
          {activeEx.sets.map((set, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-4 gap-2 items-center bg-surface border rounded-xl p-2.5 text-center transition-colors ${
                set.completed ? 'border-success/30 bg-success/5' : 'border-card'
              }`}
            >
              <span className="text-xs font-bold text-gray-400">Set {idx + 1}</span>
              
              {/* Weight Input */}
              <input
                type="number"
                value={set.weight || ''}
                onChange={(e) => updateSetDetails(activeEx.id, idx, parseFloat(e.target.value) || 0, set.reps, set.rpe)}
                disabled={set.completed}
                className="w-full bg-card border border-gray-700/60 rounded-lg py-1 px-2 text-xs font-bold text-center text-white focus:outline-none focus:border-primary disabled:opacity-60"
              />
              
              {/* Reps Input */}
              <input
                type="number"
                value={set.reps || ''}
                onChange={(e) => updateSetDetails(activeEx.id, idx, set.weight, parseInt(e.target.value) || 0, set.rpe)}
                disabled={set.completed}
                className="w-full bg-card border border-gray-700/60 rounded-lg py-1 px-2 text-xs font-bold text-center text-white focus:outline-none focus:border-primary disabled:opacity-60"
              />

              {/* Completion checkbox checkmark */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleToggleSet(activeEx.id, idx, set.completed)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border cursor-pointer ${
                    set.completed
                      ? 'bg-primary border-primary text-white shadow-[0_0_8px_#3b82f6]'
                      : 'border-gray-600 hover:border-gray-400 text-transparent'
                  }`}
                >
                  <Check size={12} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rest Timer & RPE Selection Layout */}
        <div className="mt-6 bg-surface border border-card rounded-2xl p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-card border border-gray-700/60 rounded-xl text-primary flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block leading-none">Rest Timer</span>
              <span className="text-lg font-black text-white block mt-1 leading-none">
                {formatTimerText()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-2.5 bg-card hover:bg-gray-700 border border-gray-700 text-white rounded-xl cursor-pointer"
            >
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={() => {
                setTimerSeconds(120)
                setIsTimerRunning(false)
              }}
              className="p-2.5 bg-card hover:bg-gray-700 border border-gray-700 text-white rounded-xl cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
