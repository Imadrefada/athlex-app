import { useState } from 'react'
import { useAthlexStore } from '../store/athlexStore'
import type { UserProfile } from '../store/athlexStore'
import { ArrowRight, ArrowLeft, Flame, Dumbbell, Target, Activity } from 'lucide-react'

export default function OnboardingScreen() {
  const completeOnboarding = useAthlexStore((state) => state.completeOnboarding)
  const loadDemoAccount = useAthlexStore((state) => state.loadDemoAccount)

  const [step, setStep] = useState(1)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [age, setAge] = useState<number>(24)
  const [height, setHeight] = useState<number>(180)
  const [weight, setWeight] = useState<number>(80)
  const [goal, setGoal] = useState<UserProfile['goal']>('build_muscle')
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>('moderate')
  const [targetWeight, setTargetWeight] = useState<number>(85)
  const [name, setName] = useState<string>('')

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1)
    } else {
      if (!name) return
      completeOnboarding({
        name,
        age,
        gender,
        height,
        weight,
        goal,
        activityLevel,
        targetWeight
      })
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-bg-main overflow-y-auto no-scrollbar animate-fade-in text-left">
      {/* Header Skip */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Step {step} of 5</span>
        <button
          onClick={loadDemoAccount}
          className="text-xs font-semibold text-primary hover:text-white transition-colors cursor-pointer bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full"
        >
          Load Demo Account
        </button>
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-4">
        {step === 1 && (
          <div className="animate-fade-in flex flex-col gap-3.5">
            <div className="w-full h-44 rounded-2xl overflow-hidden border border-card bg-surface relative mb-2">
              <img 
                src="/assets/onboarding_hero.png" 
                alt="ATHLEX Fitness" 
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/20 to-transparent"></div>
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-1">What is your gender?</h2>
            <p className="text-xs text-gray-400 mb-4">We use this to compute metabolic BMR base baselines.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 py-8 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer ${
                  gender === 'male'
                    ? 'border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'border-card bg-surface hover:border-gray-600 text-gray-400'
                }`}
              >
                <span className="text-3xl">👨</span>
                <span className="font-bold text-sm">Male</span>
              </button>
              <button
                onClick={() => setGender('female')}
                className={`flex-1 py-8 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer ${
                  gender === 'female'
                    ? 'border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'border-card bg-surface hover:border-gray-600 text-gray-400'
                }`}
              >
                <span className="text-3xl">👩</span>
                <span className="font-bold text-sm">Female</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-1">Tell us about yourself</h2>
              <p className="text-xs text-gray-400 mb-4">Input details to personalize formulas.</p>
            </div>

            {/* Age */}
            <div className="bg-surface border border-card rounded-xl p-4">
              <label className="text-xs font-bold text-gray-400 block mb-2">AGE (YEARS)</label>
              <div className="flex items-center justify-between">
                <input
                  type="range"
                  min="16"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-[70%] accent-primary"
                />
                <span className="text-lg font-bold text-white bg-card px-3 py-1 rounded-lg border border-gray-700 w-14 text-center">{age}</span>
              </div>
            </div>

            {/* Height */}
            <div className="bg-surface border border-card rounded-xl p-4">
              <label className="text-xs font-bold text-gray-400 block mb-2">HEIGHT (CM)</label>
              <div className="flex items-center justify-between">
                <input
                  type="range"
                  min="120"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-[70%] accent-primary"
                />
                <span className="text-lg font-bold text-white bg-card px-3 py-1 rounded-lg border border-gray-700 w-14 text-center">{height}</span>
              </div>
            </div>

            {/* Weight */}
            <div className="bg-surface border border-card rounded-xl p-4">
              <label className="text-xs font-bold text-gray-400 block mb-2">CURRENT WEIGHT (KG)</label>
              <div className="flex items-center justify-between">
                <input
                  type="range"
                  min="40"
                  max="150"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value))}
                  className="w-[70%] accent-primary"
                />
                <span className="text-lg font-bold text-white bg-card px-3 py-1 rounded-lg border border-gray-700 w-16 text-center">{weight}</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in max-h-[550px] overflow-y-auto pr-1 no-scrollbar">
            <h2 className="text-2xl font-extrabold text-white mb-2">Choose your goal</h2>
            <p className="text-xs text-gray-400 mb-6">This sets your calorie deficit or surplus targets.</p>

            <div className="flex flex-col gap-3">
              {[
                { id: 'lose_fat', label: 'Lose Fat', desc: 'Create a calorie deficit to lean out', icon: Flame, color: 'text-fat' },
                { id: 'build_muscle', label: 'Build Muscle', desc: 'Slight surplus to optimize muscle gains', icon: Dumbbell, color: 'text-primary' },
                { id: 'maintain', label: 'Maintain', desc: 'Balance energy targets to maintain weight', icon: Target, color: 'text-carbs' },
                { id: 'recomposition', label: 'Recomposition', desc: 'Lose body fat while building lean mass', icon: Activity, color: 'text-warning' }
              ].map((g) => {
                const Icon = g.icon
                const isSelected = goal === g.id
                return (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id as any)}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                        : 'border-card bg-surface hover:border-gray-700 text-gray-400'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-card border border-gray-700 ${isSelected ? g.color : ''}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white leading-none mb-1">{g.label}</h4>
                      <p className="text-[10px] text-gray-400 leading-tight">{g.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-extrabold text-white mb-2">What is your activity level?</h2>
            <p className="text-xs text-gray-400 mb-6">We multiply this by BMR to define your TDEE limit.</p>

            <div className="flex flex-col gap-3">
              {[
                { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little to no exercise' },
                { id: 'light', label: 'Lightly Active', desc: 'Light workouts 1-3 days a week' },
                { id: 'moderate', label: 'Moderately Active', desc: 'Moderate exercises 3-5 days a week' },
                { id: 'active', label: 'Very Active', desc: 'Hard workouts 6-7 days a week' },
                { id: 'extreme', label: 'Extra Active', desc: 'Athletic double sessions, heavy physical work' }
              ].map((act) => {
                const isSelected = activityLevel === act.id
                return (
                  <button
                    key={act.id}
                    onClick={() => setActivityLevel(act.id as any)}
                    className={`flex flex-col p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                        : 'border-card bg-surface hover:border-gray-700 text-gray-400'
                    }`}
                  >
                    <h4 className="font-bold text-sm text-white mb-1 leading-none">{act.label}</h4>
                    <p className="text-[10px] text-gray-400 leading-none">{act.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-1">Set your profile target</h2>
              <p className="text-xs text-gray-400 mb-4">Finalize your account setup to start tracking.</p>
            </div>

            {/* Name */}
            <div className="bg-surface border border-card rounded-xl p-4">
              <label className="text-xs font-bold text-gray-400 block mb-2 uppercase">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-card border border-gray-700 rounded-lg py-2.5 px-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary transition-colors font-medium"
              />
            </div>

            {/* Target Weight */}
            <div className="bg-surface border border-card rounded-xl p-4">
              <label className="text-xs font-bold text-gray-400 block mb-2 uppercase">TARGET WEIGHT (KG)</label>
              <div className="flex items-center justify-between">
                <input
                  type="range"
                  min="40"
                  max="150"
                  step="0.5"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
                  className="w-[70%] accent-primary"
                />
                <span className="text-lg font-bold text-white bg-card px-3 py-1 rounded-lg border border-gray-700 w-16 text-center">{targetWeight}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 mt-6 mb-4">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="flex items-center justify-center gap-2 border border-card hover:border-gray-500 text-gray-300 font-bold text-sm bg-surface rounded-xl px-5 py-3.5 cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        ) : (
          <div className="w-12"></div>
        )}

        {/* Step dots */}
        <div className="flex gap-1.5 items-center justify-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i ? 'w-4 bg-primary' : 'w-1.5 bg-card'
              }`}
            ></span>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={step === 5 && !name}
          className={`flex items-center justify-center gap-2 font-bold text-sm text-white bg-primary hover:bg-primary-dark rounded-xl px-6 py-3.5 cursor-pointer transition-colors shadow-[0_4px_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span>{step === 5 ? 'Get Started' : 'Next'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
