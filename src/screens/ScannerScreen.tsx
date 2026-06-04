import { useState } from 'react'
import { useAthlexStore } from '../store/athlexStore'
import type { MealLogs } from '../store/athlexStore'
import { Camera, RefreshCw, X, Sparkles, Check } from 'lucide-react'
import type { TabType } from '../components/BottomNav'

interface ScannerScreenProps {
  setActiveTab: (tab: TabType) => void
}

export default function ScannerScreen({ setActiveTab }: ScannerScreenProps) {
  const addFoodToMeal = useAthlexStore((state) => state.addFoodToMeal)
  
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success'>('idle')
  const [selectedMeal, setSelectedMeal] = useState<keyof MealLogs>('lunch')
  const [scannedResult, setScannedResult] = useState<any>(null)

  const handleStartScan = async () => {
    setScanState('scanning')
    try {
      // In a real app we'd capture the live webcam frame.
      // Here we will fetch the placeholder asset and convert to base64 for Gemini Vision API.
      const imgRes = await fetch('/assets/food_scanner_plate.png')
      const blob = await imgRes.blob()
      const reader = new FileReader()
      
      reader.onloadend = async () => {
        const base64data = reader.result as string
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        const response = await fetch(`${API_BASE_URL}/api/vision/scan-food`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64data })
        })
        const data = await response.json()
        setScannedResult(data)
        setScanState('success')
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Scanner error:', error)
      setScanState('idle')
    }
  }

  const handleAddFood = () => {
    if (!scannedResult) return
    
    // Add the scanned AI meal to nutrition logs
    const todayStr = new Date().toISOString().split('T')[0]
    addFoodToMeal(todayStr, selectedMeal, {
      name: scannedResult.name || 'AI Scanned Food',
      weight: scannedResult.weight || 250,
      calories: scannedResult.calories || 400,
      protein: scannedResult.protein || 30,
      carbs: scannedResult.carbs || 30,
      fat: scannedResult.fat || 10
    })
    
    // Reset and redirect
    setScanState('idle')
    setActiveTab('nutrition')
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-main relative text-left h-full overflow-hidden">
      {/* Scanner view pane */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        
        {/* Scanner Viewfinder bounding target box overlay */}
        <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center p-8 select-none z-10">
          <div className="relative w-72 h-72 border-2 border-dashed border-white/20 rounded-3xl flex items-center justify-center">
            
            {/* Corners bounding box indicators */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>

            {/* Sweep Scan line */}
            {scanState === 'scanning' && (
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scanline z-20 shadow-[0_0_10px_#3b82f6]"></div>
            )}
            
            {/* Camera Viewfinder graphics (Realistic generated food plate) */}
            <div className="w-56 h-56 rounded-full border-4 border-primary/40 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.25)]">
              <img 
                src="/assets/food_scanner_plate.png" 
                alt="Chicken Broccoli Meal" 
                className="w-full h-full object-cover scale-105"
              />
            </div>
            
            {/* Analyzing scan state loader overlay */}
            {scanState === 'scanning' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-3xl flex flex-col justify-center items-center text-center z-30">
                <RefreshCw size={36} className="text-primary animate-spin" />
                <span className="text-xs font-extrabold text-white mt-3.5 tracking-wide">AI Analyzing...</span>
                <span className="text-[10px] text-gray-400 mt-1 font-semibold">Identifying protein & carbs ratio</span>
              </div>
            )}
          </div>
        </div>

        {/* Viewfinder Top toolbar */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-40 select-none">
          <div className="bg-surface/75 backdrop-blur-md border border-card rounded-full px-4 py-2 flex items-center gap-2">
            <Camera size={14} className="text-primary" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Viewfinder</span>
          </div>
          
          <button 
            onClick={() => setActiveTab('nutrition')}
            className="p-2 bg-surface/75 backdrop-blur-md border border-card text-gray-400 hover:text-white rounded-full cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Control console / Scan results container */}
      <div className="bg-surface border-t border-card/85 p-6 z-40 relative">
        {scanState === 'idle' && (
          <div className="flex flex-col items-center justify-center gap-4 text-center animate-fade-in">
            <p className="text-xs text-gray-400 font-medium">Position food inside the viewfinder box to auto scan calories.</p>
            <button
              onClick={handleStartScan}
              className="w-16 h-16 bg-primary hover:bg-primary-dark transition-all rounded-full flex items-center justify-center text-white cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95"
            >
              <Camera size={26} strokeWidth={2} />
            </button>
            <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Tap to Scan Meal</span>
          </div>
        )}

        {scanState === 'scanning' && (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
            <span className="text-xs text-gray-400 font-semibold animate-pulse">Running computer vision analytics...</span>
          </div>
        )}

        {scanState === 'success' && scannedResult && (
          <div className="animate-fade-in flex flex-col gap-5">
            {/* Detected Details Panel */}
            <div className="flex gap-4 items-center bg-card border border-gray-700/60 p-4 rounded-2xl">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div className="flex-1">
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">Detected Food item</span>
                <h3 className="text-sm font-extrabold text-white mt-1 leading-none">{scannedResult.name}</h3>
                <span className="text-[10px] text-gray-400 mt-1.5 block font-semibold leading-none">{scannedResult.weight}g Plate Portion</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-white block leading-none">{scannedResult.calories}</span>
                <span className="text-[9px] text-gray-500 font-bold block mt-1 uppercase">Calories</span>
              </div>
            </div>

            {/* Macro distribution list */}
            <div className="grid grid-cols-3 gap-2 bg-card/40 border border-card rounded-xl p-3 text-center text-[10px] font-bold">
              <div className="flex flex-col">
                <span className="text-protein">{scannedResult.protein}g Protein</span>
                <div className="w-full h-1 bg-protein/30 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-protein rounded-full w-full"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-carbs">{scannedResult.carbs}g Carbs</span>
                <div className="w-full h-1 bg-carbs/20 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-carbs rounded-full w-full"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-fat">{scannedResult.fat}g Fat</span>
                <div className="w-full h-1 bg-fat/30 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-fat rounded-full w-full"></div>
                </div>
              </div>
            </div>

            {/* Meal Selector dropdown and actions */}
            <div className="flex gap-3">
              <select
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value as any)}
                className="bg-card border border-gray-700/60 rounded-xl px-4 text-xs font-bold text-white focus:outline-none focus:border-primary w-[40%] cursor-pointer"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </select>

              <button
                onClick={handleAddFood}
                className="flex-1 py-3 bg-primary hover:bg-primary-dark transition-colors font-bold text-xs text-white rounded-xl text-center cursor-pointer shadow-[0_4px_12px_rgba(59,130,246,0.25)] flex items-center justify-center gap-1.5"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>Add Scanned Food</span>
              </button>
            </div>
            
            <button
              onClick={() => setScanState('idle')}
              className="text-center text-[10px] text-gray-500 font-bold hover:text-white transition-colors uppercase leading-none mt-1 hover:underline cursor-pointer"
            >
              Retake / Cancel Scan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
