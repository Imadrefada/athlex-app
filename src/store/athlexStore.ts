import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface UserProfile {
  name: string
  age: number
  gender: 'male' | 'female'
  height: number // cm
  weight: number // kg
  bodyFat?: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme'
  goal: 'lose_fat' | 'build_muscle' | 'maintain' | 'recomposition' | 'powerlifting' | 'athletic'
  targetWeight: number // kg
  streak: number
  level: number
  xp: number
  calorieTarget: number
  proteinTarget: number
  carbsTarget: number
  fatTarget: number
}

export interface FoodItem {
  id: string
  name: string
  weight: number // g
  calories: number
  protein: number // g
  carbs: number // g
  fat: number // g
}

export interface MealLogs {
  breakfast: FoodItem[]
  lunch: FoodItem[]
  dinner: FoodItem[]
  snacks: FoodItem[]
}

export interface WorkoutSet {
  weight: number
  reps: number
  rpe: number
  completed: boolean
}

export interface WorkoutExercise {
  id: string
  name: string
  muscleGroup: string
  sets: WorkoutSet[]
}

export interface WorkoutSession {
  id: string
  name: string
  date: string
  exercises: WorkoutExercise[]
  completed: boolean
}

export interface WeightLog {
  date: string // YYYY-MM-DD
  weight: number // kg
}

export interface MeasurementLog {
  date: string
  chest?: number
  waist?: number
  arms?: number
  legs?: number
  neck?: number
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'coach'
  text: string
  timestamp: number
  isReport?: boolean
  reportData?: {
    workouts: number
    caloriesBurned: number
    avgProtein: number
    weightChange: number
  }
}

export interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: string
  icon: string
}

export interface SearchResultFood {
  id: string
  name: string
  image: string
  calories: number
  protein: number
  carbs: number
  fat: number
  weight: number
}

export interface SearchResultExercise {
  id: string
  name: string
  image: string
  muscleTargeted: string
  exerciseType: string
  setsNeeded: number
  repsNeeded: number
}

interface AthlexState {
  user: UserProfile | null
  nutritionLogs: Record<string, MealLogs> // date string -> meals
  weightLogs: WeightLog[]
  measurementLogs: MeasurementLog[]
  workoutHistory: WorkoutSession[]
  activeWorkout: WorkoutSession | null
  chatMessages: ChatMessage[]
  achievements: Achievement[]
  
  // Dynamic Search State
  isSearching: boolean
  searchResultsFood: SearchResultFood[]
  searchResultsExercise: SearchResultExercise[]
  searchInternetForFood: (query: string) => Promise<void>
  searchInternetForExercise: (query: string, muscleFilter?: string) => Promise<void>
  clearSearchResults: () => void
  
  // App Helper Constants
  exerciseDatabase: { id: string; name: string; muscleGroup: string; equipment: string; instructions: string[] }[]
  foodDatabase: FoodItem[]
  
  // Actions
  completeOnboarding: (profile: Omit<UserProfile, 'calorieTarget' | 'proteinTarget' | 'carbsTarget' | 'fatTarget' | 'streak' | 'level' | 'xp'>) => void
  loadDemoAccount: () => void
  resetApp: () => void
  
  // Nutrition Actions
  addFoodToMeal: (date: string, mealType: keyof MealLogs, food: Omit<FoodItem, 'id'>) => void
  removeFoodFromMeal: (date: string, mealType: keyof MealLogs, foodId: string) => void
  
  // Workout Actions
  startWorkout: (name: string) => void
  startCustomWorkout: (ex: SearchResultExercise) => void
  startAIWorkout: (goal: string, duration?: number, equipment?: string) => Promise<void>
  toggleSetCompletion: (exerciseId: string, setIndex: number) => void
  updateSetDetails: (exerciseId: string, setIndex: number, weight: number, reps: number, rpe: number) => void
  addSetToExercise: (exerciseId: string) => void
  cancelWorkout: () => void
  completeWorkout: () => void
  
  // Progress Actions
  logWeight: (date: string, weight: number) => void
  logMeasurements: (date: string, measurements: Omit<MeasurementLog, 'date'>) => void
  
  // Gamification Actions
  addXp: (amount: number) => void
  incrementStreak: () => void
  
  // Coach Actions
  sendMessageToCoach: (text: string) => void
}

// Mifflin-St Jeor math calculations
export const calculateTargets = (
  gender: 'male' | 'female',
  weight: number,
  height: number,
  age: number,
  activityLevel: UserProfile['activityLevel'],
  goal: UserProfile['goal']
) => {
  // BMR
  let bmr = 10 * weight + 6.25 * height - 5 * age
  if (gender === 'male') {
    bmr += 5
  } else {
    bmr -= 161
  }

  // TDEE
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9
  }
  const tdee = Math.round(bmr * multipliers[activityLevel])

  // Calorie Goal Adjustment
  let calorieTarget = tdee
  if (goal === 'lose_fat') calorieTarget = tdee - 500
  else if (goal === 'build_muscle') calorieTarget = tdee + 300
  
  // Macronutrients
  const proteinTarget = Math.round(weight * 2.2) // 2.2g per kg
  const fatTarget = Math.round(weight * 0.8) // 0.8g per kg
  const proteinCalories = proteinTarget * 4
  const fatCalories = fatTarget * 9
  const remainingCalories = calorieTarget - proteinCalories - fatCalories
  const carbsTarget = Math.max(0, Math.round(remainingCalories / 4))

  return { calorieTarget, proteinTarget, carbsTarget, fatTarget }
}

const initialExercises = [
  { id: '1', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', instructions: ['Lie on a flat bench.', 'Grip the bar slightly wider than shoulder width.', 'Lower the bar to your chest.', 'Push the bar back up.'] },
  { id: '2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells', instructions: ['Set a bench to a 30-45 degree incline.', 'Press the dumbbells up above your shoulders.', 'Lower them slowly to chest height and press back up.'] },
  { id: '3', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbells', instructions: ['Stand tall holding dumbbells at your sides.', 'Raise arms out to the sides until parallel to the floor.', 'Lower under control.'] },
  { id: '4', name: 'Tricep Rope Pushdown', muscleGroup: 'Arms', equipment: 'Cable', instructions: ['Attach rope to high cable pulley.', 'Keep elbows tucked in at your sides.', 'Extend elbows down to lock out, flexing triceps.'] },
  { id: '5', name: 'Barbell Squat', muscleGroup: 'Legs', equipment: 'Barbell', instructions: ['Rest bar on upper back, feet shoulder width.', 'Squat down by pushing hips back, keeping chest up.', 'Drive up to start position.'] },
  { id: '6', name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell', instructions: ['Stand with feet mid-bar.', 'Bend at hips and knees, grip bar.', 'Drive feet into floor, lifting bar keeping back straight.'] },
  { id: '7', name: 'Pull-up', muscleGroup: 'Back', equipment: 'Bodyweight', instructions: ['Hang from bar with hands wider than shoulder width.', 'Pull chest up to the bar.', 'Lower down slowly.'] }
]

const initialFoods = [
  { id: 'f1', name: 'Oatmeal with Berries', weight: 150, calories: 550, protein: 15, carbs: 80, fat: 10 },
  { id: 'f2', name: 'Grilled Chicken Breast', weight: 200, calories: 450, protein: 60, carbs: 0, fat: 15 },
  { id: 'f3', name: 'Brown Rice', weight: 150, calories: 200, protein: 5, carbs: 40, fat: 2 },
  { id: 'f4', name: 'Salmon Fillet', weight: 200, calories: 600, protein: 50, carbs: 0, fat: 35 },
  { id: 'f5', name: 'Whey Protein Shake', weight: 40, calories: 150, protein: 30, carbs: 3, fat: 1 },
  { id: 'f6', name: 'Whole Eggs', weight: 150, calories: 220, protein: 18, carbs: 1, fat: 15 },
  { id: 'f7', name: 'Banana', weight: 120, calories: 105, protein: 1, carbs: 27, fat: 0 },
  { id: 'f8', name: 'Almonds', weight: 30, calories: 170, protein: 6, carbs: 6, fat: 15 }
]

const defaultAchievements = [
  { id: 'a1', title: 'First Steps', description: 'Log your first meal or weight entry', unlocked: false, icon: 'Flame' },
  { id: 'a2', title: 'Iron Initiate', description: 'Complete your first tracked workout', unlocked: false, icon: 'Dumbbell' },
  { id: 'a3', title: 'Consistent Gains', description: 'Unlock a 7-day streak', unlocked: false, icon: 'Calendar' },
  { id: 'a4', title: 'Century Club', description: 'Lift a total workout volume over 1,000kg', unlocked: false, icon: 'Award' },
  { id: 'a5', title: 'Peak Protein', description: 'Hit your protein target for the day', unlocked: false, icon: 'Beef' },
  { id: 'a6', title: 'AI Guided', description: 'Send a message to your AI Coach', unlocked: false, icon: 'Bot' }
]

export const useAthlexStore = create<AthlexState>()(
  persist(
    (set, get) => ({
      user: null,
      nutritionLogs: {},
      weightLogs: [],
      measurementLogs: [],
      workoutHistory: [],
      activeWorkout: null,
      chatMessages: [],
      achievements: defaultAchievements,
      isSearching: false,
      searchResultsFood: [],
      searchResultsExercise: [],
      exerciseDatabase: initialExercises,
      foodDatabase: initialFoods,

      completeOnboarding: (profile) => {
        const { calorieTarget, proteinTarget, carbsTarget, fatTarget } = calculateTargets(
          profile.gender,
          profile.weight,
          profile.height,
          profile.age,
          profile.activityLevel,
          profile.goal
        )

        const newUser: UserProfile = {
          ...profile,
          streak: 1,
          level: 1,
          xp: 100,
          calorieTarget,
          proteinTarget,
          carbsTarget,
          fatTarget
        }

        const todayStr = new Date().toISOString().split('T')[0]

        set({
          user: newUser,
          weightLogs: [{ date: todayStr, weight: profile.weight }],
          chatMessages: [
            {
              id: 'c0',
              sender: 'coach',
              text: `Welcome to ATHLEX, ${profile.name}! I am your AI Coach. I've computed your targets: ${calorieTarget} kcal, ${proteinTarget}g Protein, ${carbsTarget}g Carbs, and ${fatTarget}g Fat. What are we tracking today?`,
              timestamp: Date.now()
            }
          ]
        })
      },

      loadDemoAccount: () => {
        const todayStr = new Date().toISOString().split('T')[0]
        
        // Generate historical weight data over last month
        const weightLogs: WeightLog[] = []
        const baseDate = new Date()
        for (let i = 30; i >= 0; i--) {
          const d = new Date(baseDate)
          d.setDate(baseDate.getDate() - i)
          const dateStr = d.toISOString().split('T')[0]
          // Slowly drop weight from 82.4 to 81.2
          const weight = 82.4 - ((30 - i) / 30) * 1.2 + (Math.sin(i) * 0.1)
          weightLogs.push({ date: dateStr, weight: parseFloat(weight.toFixed(1)) })
        }
        // Override today's weight specifically to 81.2
        weightLogs[weightLogs.length - 1] = { date: todayStr, weight: 81.2 }

        // Populate today's nutrition logs
        const todayNutrition: MealLogs = {
          breakfast: [
            { id: 'f1-d', name: 'Oatmeal with Berries', weight: 150, calories: 550, protein: 15, carbs: 80, fat: 10 }
          ],
          lunch: [
            { id: 'f2-d', name: 'Grilled Chicken Breast', weight: 200, calories: 450, protein: 60, carbs: 0, fat: 15 },
            { id: 'f3-d', name: 'Brown Rice', weight: 150, calories: 200, protein: 5, carbs: 40, fat: 2 }
          ],
          dinner: [
            { id: 'f4-d', name: 'Salmon Fillet', weight: 200, calories: 600, protein: 50, carbs: 0, fat: 35 }
          ],
          snacks: [
            { id: 'f5-d', name: 'Whey Protein Shake', weight: 40, calories: 150, protein: 30, carbs: 3, fat: 1 },
            { id: 'f6-d', name: 'Whole Eggs', weight: 120, calories: 350, protein: 10, carbs: 12, fat: 7 }
          ]
        }

        const user: UserProfile = {
          name: 'Imad Khan',
          age: 24,
          gender: 'male',
          height: 180,
          weight: 81.2,
          goal: 'build_muscle',
          activityLevel: 'active',
          targetWeight: 85,
          streak: 24,
          level: 12,
          xp: 8450,
          calorieTarget: 2800,
          proteinTarget: 180,
          carbsTarget: 300,
          fatTarget: 80
        }

        const chatMessages: ChatMessage[] = [
          {
            id: 'c1',
            sender: 'coach',
            text: "Welcome back, Imad! Hope your training is going strong. What can I do for you today?",
            timestamp: Date.now() - 3600000 * 24
          },
          {
            id: 'c2',
            sender: 'user',
            text: "How was my progress this week?",
            timestamp: Date.now() - 60000
          },
          {
            id: 'c3',
            sender: 'coach',
            text: "Great job this week! You worked out 4 times and burned 2,450 calories. Your average protein intake was 165g, which is good. Keep pushing!",
            timestamp: Date.now() - 30000,
            isReport: true,
            reportData: {
              workouts: 4,
              caloriesBurned: 2450,
              avgProtein: 165,
              weightChange: -0.4
            }
          }
        ]

        const achievements = defaultAchievements.map(a => {
          if (['a1', 'a2', 'a3', 'a4', 'a5'].includes(a.id)) {
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
          }
          return a
        })

        // Generate past workout logs
        const workoutHistory: WorkoutSession[] = [
          {
            id: 'w-prev1',
            name: 'Pull Day',
            date: new Date(baseDate.getTime() - 86400000 * 2).toISOString().split('T')[0],
            completed: true,
            exercises: [
              {
                id: '7',
                name: 'Pull-up',
                muscleGroup: 'Back',
                sets: [
                  { weight: 0, reps: 12, rpe: 8, completed: true },
                  { weight: 0, reps: 10, rpe: 9, completed: true },
                  { weight: 0, reps: 8, rpe: 9, completed: true }
                ]
              },
              {
                id: '6',
                name: 'Deadlift',
                muscleGroup: 'Back',
                sets: [
                  { weight: 100, reps: 5, rpe: 8, completed: true },
                  { weight: 110, reps: 5, rpe: 9, completed: true }
                ]
              }
            ]
          }
        ]

        set({
          user,
          weightLogs,
          nutritionLogs: { [todayStr]: todayNutrition },
          chatMessages,
          achievements,
          workoutHistory,
          activeWorkout: null
        })
      },

      resetApp: () => {
        set({
          user: null,
          nutritionLogs: {},
          weightLogs: [],
          measurementLogs: [],
          workoutHistory: [],
          activeWorkout: null,
          chatMessages: [],
          achievements: defaultAchievements
        })
      },

      addFoodToMeal: (date, mealType, food) => {
        const uniqueId = `food-${Date.now()}`
        const foodWithId: FoodItem = { ...food, id: uniqueId }
        
        const logs = { ...get().nutritionLogs }
        if (!logs[date]) {
          logs[date] = { breakfast: [], lunch: [], dinner: [], snacks: [] }
        }

        logs[date][mealType].push(foodWithId)
        
        set({ nutritionLogs: logs })
        get().addXp(10) // +10 XP for food logging

        // Check achievement for hit protein target
        const todayLogs = logs[date]
        const totalProtein = ['breakfast', 'lunch', 'dinner', 'snacks'].reduce((sum, type) => {
          return sum + (todayLogs[type as keyof MealLogs]?.reduce((s, f) => s + f.protein, 0) || 0)
        }, 0)

        const user = get().user
        if (user && totalProtein >= user.proteinTarget) {
          const achievements = get().achievements.map(a => {
            if (a.id === 'a5' && !a.unlocked) {
              get().addXp(100)
              return { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
            }
            return a
          })
          set({ achievements })
        }
      },

      removeFoodFromMeal: (date, mealType, foodId) => {
        const logs = { ...get().nutritionLogs }
        if (logs[date] && logs[date][mealType]) {
          logs[date][mealType] = logs[date][mealType].filter(f => f.id !== foodId)
          set({ nutritionLogs: logs })
        }
      },

      startWorkout: (name) => {
        const todayStr = new Date().toISOString().split('T')[0]
        
        // Define default exercises for the workout routine
        let exercises: WorkoutExercise[] = []
        if (name === 'Push Day') {
          exercises = [
            {
              id: '1',
              name: 'Bench Press',
              muscleGroup: 'Chest',
              sets: [
                { weight: 80, reps: 10, rpe: 8, completed: false },
                { weight: 80, reps: 8, rpe: 8, completed: false },
                { weight: 75, reps: 10, rpe: 8, completed: false },
                { weight: 72.5, reps: 8, rpe: 8, completed: false }
              ]
            },
            {
              id: '2',
              name: 'Incline Dumbbell Press',
              muscleGroup: 'Chest',
              sets: [
                { weight: 30, reps: 10, rpe: 8, completed: false },
                { weight: 30, reps: 9, rpe: 9, completed: false },
                { weight: 26, reps: 10, rpe: 8, completed: false }
              ]
            },
            {
              id: '3',
              name: 'Dumbbell Lateral Raise',
              muscleGroup: 'Shoulders',
              sets: [
                { weight: 12.5, reps: 15, rpe: 8, completed: false },
                { weight: 12.5, reps: 12, rpe: 9, completed: false }
              ]
            }
          ]
        } else {
          exercises = [
            {
              id: '7',
              name: 'Pull-up',
              muscleGroup: 'Back',
              sets: [
                { weight: 0, reps: 10, rpe: 8, completed: false },
                { weight: 0, reps: 8, rpe: 9, completed: false }
              ]
            }
          ]
        }

        const session: WorkoutSession = {
          id: `workout-${Date.now()}`,
          name,
          date: todayStr,
          exercises,
          completed: false
        }

        set({ activeWorkout: session })
      },

      startCustomWorkout: (ex) => {
        const session: WorkoutSession = {
          id: `workout-${Date.now()}`,
          name: `${ex.name} Session`,
          date: new Date().toISOString().split('T')[0],
          exercises: [{
             id: ex.id,
             name: ex.name,
             muscleGroup: ex.muscleTargeted,
             sets: Array.from({length: ex.setsNeeded}).map(() => ({ weight: 0, reps: ex.repsNeeded, rpe: 8, completed: false }))
          }],
          completed: false
        }
        set({ activeWorkout: session })
      },

      startAIWorkout: async (goal, duration = 45, equipment = 'Full Gym') => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/coach/generate-routine`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goal, durationMinutes: duration, equipment, experienceLevel: 'Intermediate' })
          });
          
          if (!response.ok) throw new Error('Failed to generate AI workout');
          const data = await response.json();
          
          const session: WorkoutSession = {
            id: `workout-${Date.now()}`,
            name: data.name,
            date: new Date().toISOString().split('T')[0],
            exercises: data.exercises,
            completed: false
          };
          set({ activeWorkout: session });
        } catch (error) {
          console.error("AI Workout Error:", error);
          // Fallback to push day
          get().startWorkout('Push Day');
        }
      },

      toggleSetCompletion: (exerciseId, setIndex) => {
        const active = get().activeWorkout
        if (!active) return

        const updatedExercises = active.exercises.map(ex => {
          if (ex.id === exerciseId) {
            const updatedSets = ex.sets.map((set, idx) => {
              if (idx === setIndex) {
                return { ...set, completed: !set.completed }
              }
              return set
            })
            return { ...ex, sets: updatedSets }
          }
          return ex
        })

        set({
          activeWorkout: {
            ...active,
            exercises: updatedExercises
          }
        })
      },

      updateSetDetails: (exerciseId, setIndex, weight, reps, rpe) => {
        const active = get().activeWorkout
        if (!active) return

        const updatedExercises = active.exercises.map(ex => {
          if (ex.id === exerciseId) {
            const updatedSets = ex.sets.map((set, idx) => {
              if (idx === setIndex) {
                return { ...set, weight, reps, rpe }
              }
              return set
            })
            return { ...ex, sets: updatedSets }
          }
          return ex
        })

        set({
          activeWorkout: {
            ...active,
            exercises: updatedExercises
          }
        })
      },

      addSetToExercise: (exerciseId) => {
        const active = get().activeWorkout
        if (!active) return

        const updatedExercises = active.exercises.map(ex => {
          if (ex.id === exerciseId) {
            const lastSet = ex.sets[ex.sets.length - 1]
            const newSet: WorkoutSet = lastSet 
              ? { ...lastSet, completed: false } 
              : { weight: 20, reps: 10, rpe: 8, completed: false }
            return { ...ex, sets: [...ex.sets, newSet] }
          }
          return ex
        })

        set({
          activeWorkout: {
            ...active,
            exercises: updatedExercises
          }
        })
      },

      cancelWorkout: () => {
        set({ activeWorkout: null })
      },

      completeWorkout: () => {
        const active = get().activeWorkout
        if (!active) return

        const completedSession: WorkoutSession = {
          ...active,
          completed: true
        }

        const user = get().user
        if (user) {
          const newStreak = user.streak + 1
          const newXp = user.xp + 50 // +50 XP for completed workout
          // Simple leveling up math: 1000 XP per level
          const newLevel = Math.floor(newXp / 1000) + 1
          
          set({
            user: {
              ...user,
              streak: newStreak,
              xp: newXp,
              level: newLevel
            }
          })
        }

        // Add to history
        const history = [completedSession, ...get().workoutHistory]
        
        // Check achievements
        const achievements = get().achievements.map(a => {
          if (a.id === 'a2' && !a.unlocked) {
            get().addXp(100)
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
          }
          return a
        })

        set({
          workoutHistory: history,
          activeWorkout: null,
          achievements
        })
      },

      logWeight: (date, weight) => {
        const weightLogs = [...get().weightLogs]
        const existingIdx = weightLogs.findIndex(w => w.date === date)
        
        if (existingIdx > -1) {
          weightLogs[existingIdx].weight = weight
        } else {
          weightLogs.push({ date, weight })
        }
        
        // Sort weight logs chronologically
        weightLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        
        const user = get().user
        if (user) {
          // Update profile weight if logging for today
          const todayStr = new Date().toISOString().split('T')[0]
          const updatedUser = date === todayStr ? { ...user, weight } : user
          
          // Re-calculate macro goals based on new weight!
          if (date === todayStr) {
            const { calorieTarget, proteinTarget, carbsTarget, fatTarget } = calculateTargets(
              user.gender,
              weight,
              user.height,
              user.age,
              user.activityLevel,
              user.goal
            )
            set({
              user: {
                ...updatedUser,
                calorieTarget,
                proteinTarget,
                carbsTarget,
                fatTarget
              }
            })
          } else {
            set({ user: updatedUser })
          }
        }
        
        set({ weightLogs })
        get().addXp(10) // Logging weight gives +10 XP
      },

      logMeasurements: (date, measurements) => {
        const measurementLogs = [...get().measurementLogs]
        const existingIdx = measurementLogs.findIndex(m => m.date === date)

        if (existingIdx > -1) {
          measurementLogs[existingIdx] = { date, ...measurements }
        } else {
          measurementLogs.push({ date, ...measurements })
        }

        set({ measurementLogs })
        get().addXp(10)
      },

      addXp: (amount) => {
        const user = get().user
        if (!user) return

        const newXp = user.xp + amount
        const newLevel = Math.floor(newXp / 1000) + 1

        set({
          user: {
            ...user,
            xp: newXp,
            level: newLevel
          }
        })
      },

      incrementStreak: () => {
        const user = get().user
        if (!user) return
        set({
          user: {
            ...user,
            streak: user.streak + 1
          }
        })
      },

      sendMessageToCoach: async (text) => {
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'user',
          text,
          timestamp: Date.now()
        }

        const messages = [...get().chatMessages, newMsg]
        set({ chatMessages: messages })
        get().addXp(10) // sending a message gives +10 XP

        // Unlock AI Coach Achievement
        const achievements = get().achievements.map(a => {
          if (a.id === 'a6' && !a.unlocked) {
            get().addXp(100)
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
          }
          return a
        })
        set({ achievements })

        try {
          const response = await fetch(`${API_BASE_URL}/api/coach/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages,
              userProfile: get().user
            })
          })
          
          if (!response.ok) throw new Error('Failed to get coach response')
          
          const data = await response.json()
          
          const coachMsg: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'coach',
            text: data.text || "Sorry, I couldn't process that right now.",
            timestamp: Date.now()
          }

          set({ chatMessages: [...get().chatMessages, coachMsg] })
        } catch (error) {
          console.error('Coach API Error:', error)
          const errorMsg: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'coach',
            text: "Network error: Make sure the ATHLEX backend is running.",
            timestamp: Date.now()
          }
          set({ chatMessages: [...get().chatMessages, errorMsg] })
        }
      },

      searchInternetForFood: async (query: string) => {
        set({ isSearching: true, searchResultsFood: [] })
        try {
          const response = await fetch(`${API_BASE_URL}/api/search/food?q=${encodeURIComponent(query)}`)
          if (!response.ok) throw new Error('Network response was not ok')
          const data = await response.json()
          set({ isSearching: false, searchResultsFood: data })
        } catch (error) {
          console.error("Error searching food:", error)
          set({ isSearching: false, searchResultsFood: [] })
        }
      },

      searchInternetForExercise: async (query: string, muscleFilter?: string) => {
        set({ isSearching: true, searchResultsExercise: [] })
        try {
          let url = `http://localhost:5000/api/search/exercise?q=${encodeURIComponent(query)}`
          if (muscleFilter) url += `&muscle=${encodeURIComponent(muscleFilter)}`
          const response = await fetch(url)
          if (!response.ok) throw new Error('Network response was not ok')
          const data = await response.json()
          set({ isSearching: false, searchResultsExercise: data })
        } catch (error) {
          console.error("Error searching exercise:", error)
          set({ isSearching: false, searchResultsExercise: [] })
        }
      },

      clearSearchResults: () => {
        set({ searchResultsFood: [], searchResultsExercise: [] })
      }
    }),
    {
      name: 'athlex-storage'
    }
  )
)
