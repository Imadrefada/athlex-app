import { useState } from 'react'
import { useAthlexStore } from '../store/athlexStore'
import { Plus, Calendar, Activity, X } from 'lucide-react'

export default function ProgressScreen() {
  const user = useAthlexStore((state) => state.user)
  const weightLogs = useAthlexStore((state) => state.weightLogs)
  const measurementLogs = useAthlexStore((state) => state.measurementLogs)
  const workoutHistory = useAthlexStore((state) => state.workoutHistory)
  const logWeight = useAthlexStore((state) => state.logWeight)
  const logMeasurements = useAthlexStore((state) => state.logMeasurements)

  // Subtabs state
  const [activeSubTab, setActiveSubTab] = useState<'weight' | 'measurements' | 'strength'>('weight')

  // Form states
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0])

  const [chest, setChest] = useState('')
  const [waist, setWaist] = useState('')
  const [arms, setArms] = useState('')
  const [legs, setLegs] = useState('')
  const [neck, setNeck] = useState('')

  // Chart hover state
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; weight: number; date: string } | null>(null)

  if (!user) return null

  // Calculate Statistics dynamically
  const weights = weightLogs.map(l => l.weight)
  const highestWeight = weights.length > 0 ? Math.max(...weights) : 81.2
  const lowestWeight = weights.length > 0 ? Math.min(...weights) : 81.2
  const avgWeight = weights.length > 0 ? parseFloat((weights.reduce((s, w) => s + w, 0) / weights.length).toFixed(1)) : 81.2

  const handleLogWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWeight) return
    logWeight(newDate, parseFloat(newWeight))
    setNewWeight('')
    setShowWeightModal(false)
  }

  const handleLogMeasurementsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const todayStr = new Date().toISOString().split('T')[0]
    logMeasurements(todayStr, {
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      arms: arms ? parseFloat(arms) : undefined,
      legs: legs ? parseFloat(legs) : undefined,
      neck: neck ? parseFloat(neck) : undefined
    })
    setChest('')
    setWaist('')
    setArms('')
    setLegs('')
    setNeck('')
    alert("Measurements saved successfully!")
  }

  // Generate SVG weight line path
  const chartWidth = 330
  const chartHeight = 150
  const margin = 20
  
  // Display last 12 weight logs on the chart
  const chartLogs = weightLogs.slice(-12)
  const hasMultiplePoints = chartLogs.length > 1

  let svgPath = ''
  let areaPath = ''
  let chartPoints: { x: number; y: number; weight: number; date: string }[] = []

  if (hasMultiplePoints) {
    const minW = Math.min(...chartLogs.map(l => l.weight)) - 0.5
    const maxW = Math.max(...chartLogs.map(l => l.weight)) + 0.5
    const wRange = maxW - minW || 1

    const usableWidth = chartWidth - margin * 2
    const usableHeight = chartHeight - margin * 2

    chartPoints = chartLogs.map((log, idx) => {
      const x = margin + (idx / (chartLogs.length - 1)) * usableWidth
      const y = chartHeight - margin - ((log.weight - minW) / wRange) * usableHeight
      return { x, y, weight: log.weight, date: log.date }
    })

    svgPath = `M ${chartPoints.map(p => `${p.x},${p.y}`).join(' L ')}`
    areaPath = `${svgPath} L ${chartPoints[chartPoints.length - 1].x},${chartHeight - margin} L ${chartPoints[0].x},${chartHeight - margin} Z`
  }

  // Hover detection mapping helper
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!hasMultiplePoints) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left

    // Find closest point by X coordinate
    let closest = chartPoints[0]
    let minDiff = Math.abs(closest.x - mouseX)

    chartPoints.forEach(p => {
      const diff = Math.abs(p.x - mouseX)
      if (diff < minDiff) {
        minDiff = diff
        closest = p
      }
    })

    // Only hover if mouse is relatively close
    if (minDiff < 30) {
      // Format date for tooltip display
      const formattedDate = new Date(closest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      setHoveredPoint({ x: closest.x, y: closest.y, weight: closest.weight, date: formattedDate })
    } else {
      setHoveredPoint(null)
    }
  }

  // Get Personal records dynamically
  const getStrengthPRs = () => {
    const prs: Record<string, number> = {}
    workoutHistory.forEach(wk => {
      wk.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.completed) {
            const currentPR = prs[ex.name] || 0
            if (s.weight > currentPR) {
              prs[ex.name] = s.weight
            }
          }
        })
      })
    })
    
    // Return formatted list of PRs
    return Object.entries(prs).map(([name, weight]) => ({ name, weight }))
  }

  const prsList = getStrengthPRs()

  return (
    <div className="flex-1 flex flex-col p-5 overflow-y-auto no-scrollbar bg-bg-main relative text-left pb-24">
      {/* Log Weight Modal Dialogue */}
      {showWeightModal && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-surface border border-card rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-white text-sm">Log Body Weight</h3>
              <button
                onClick={() => setShowWeightModal(false)}
                className="p-1 hover:bg-card rounded-full text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleLogWeightSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Log Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-card border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Body Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 81.2"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-card border border-gray-700/60 rounded-xl py-2 px-3 text-xs font-bold text-white focus:outline-none focus:border-primary text-center"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary-dark transition-colors font-bold text-xs text-white rounded-xl text-center cursor-pointer shadow-[0_4px_12px_rgba(59,130,246,0.25)]"
              >
                Save Weight Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Screen Title */}
      <div className="mt-3">
        <h2 className="text-2xl font-extrabold text-white">Progress Analytics</h2>
        <p className="text-xs text-gray-400 mt-1">Track body weight logs, dimensions, and lift records.</p>
      </div>

      {/* Sub tabs nav buttons */}
      <div className="flex gap-2 mt-5 p-1 bg-surface border border-card rounded-xl">
        <button
          onClick={() => setActiveSubTab('weight')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition-all ${
            activeSubTab === 'weight' ? 'bg-card border border-gray-700 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Weight
        </button>
        <button
          onClick={() => setActiveSubTab('measurements')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition-all ${
            activeSubTab === 'measurements' ? 'bg-card border border-gray-700 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Measurements
        </button>
        <button
          onClick={() => setActiveSubTab('strength')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition-all ${
            activeSubTab === 'strength' ? 'bg-card border border-gray-700 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Strength
        </button>
      </div>

      {/* Tab Panel 1: WEIGHT ANALYTICS */}
      {activeSubTab === 'weight' && (
        <div className="animate-fade-in flex flex-col gap-4.5 mt-5">
          
          {/* Chart View */}
          <div className="bg-surface border border-card rounded-2xl p-4.5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2 px-1">
              <div>
                <h4 className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none">Weight History</h4>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-lg font-black text-white leading-none">{user.weight.toFixed(1)}</span>
                  <span className="text-xs text-gray-400 font-bold">kg</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowWeightModal(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                <Plus size={12} />
                <span>Log weight</span>
              </button>
            </div>

            {/* Interactive SVG Chart Container */}
            {hasMultiplePoints ? (
              <div className="relative">
                <svg
                  width="100%"
                  height={chartHeight}
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  onMouseMove={handleSvgMouseMove}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="overflow-visible"
                >
                  <defs>
                    <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  <line x1={margin} y1={margin} x2={chartWidth - margin} y2={margin} className="stroke-card/50" strokeWidth="1" />
                  <line x1={margin} y1={chartHeight / 2} x2={chartWidth - margin} y2={chartHeight / 2} className="stroke-card/50" strokeWidth="1" />
                  <line x1={margin} y1={chartHeight - margin} x2={chartWidth - margin} y2={chartHeight - margin} className="stroke-card/50" strokeWidth="1" />

                  {/* Gradient Area under path */}
                  <path d={areaPath} fill="url(#area-gradient)" />

                  {/* Polyline Path */}
                  <path
                    d={svgPath}
                    fill="none"
                    className="stroke-primary"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interaction Tooltip Elements */}
                  {hoveredPoint && (
                    <>
                      {/* Vertical line indicator */}
                      <line
                        x1={hoveredPoint.x}
                        y1={margin}
                        x2={hoveredPoint.x}
                        y2={chartHeight - margin}
                        className="stroke-gray-500/50"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      {/* Circle dot on path */}
                      <circle
                        cx={hoveredPoint.x}
                        cy={hoveredPoint.y}
                        r="5"
                        className="fill-primary stroke-bg-main"
                        strokeWidth="2"
                      />
                      <circle
                        cx={hoveredPoint.x}
                        cy={hoveredPoint.y}
                        r="9"
                        className="fill-primary/20"
                      />
                    </>
                  )}
                </svg>

                {/* Date labels at bottom */}
                <div className="flex justify-between px-3.5 text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                  <span>{new Date(chartLogs[0].date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                  <span>{new Date(chartLogs[chartLogs.length - 1].date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                </div>

                {/* Float Tooltip Box */}
                {hoveredPoint && (
                  <div
                    className="absolute bg-card border border-gray-700/60 py-1.5 px-2.5 rounded-xl text-center pointer-events-none shadow-md z-30"
                    style={{
                      left: `${Math.min(chartWidth - 80, Math.max(10, hoveredPoint.x - 40))}px`,
                      top: `${Math.max(5, hoveredPoint.y - 45)}px`
                    }}
                  >
                    <span className="text-[8px] text-gray-400 font-bold block uppercase leading-none">{hoveredPoint.date}</span>
                    <span className="text-xs font-black text-white block mt-1 leading-none">{hoveredPoint.weight} kg</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-gray-500 font-medium">
                Log at least 2 weight values to visualize chart trend.
              </div>
            )}
          </div>

          {/* Calorie Stats Card grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface border border-card rounded-xl p-3 flex flex-col text-center">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Highest</span>
              <span className="text-sm font-extrabold text-white mt-1">{highestWeight.toFixed(1)} kg</span>
            </div>
            <div className="bg-surface border border-card rounded-xl p-3 flex flex-col text-center">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Lowest</span>
              <span className="text-sm font-extrabold text-white mt-1">{lowestWeight.toFixed(1)} kg</span>
            </div>
            <div className="bg-surface border border-card rounded-xl p-3 flex flex-col text-center">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Average</span>
              <span className="text-sm font-extrabold text-white mt-1">{avgWeight.toFixed(1)} kg</span>
            </div>
          </div>

          {/* Logs scrollable List */}
          <div className="bg-surface border border-card rounded-2xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Weight Logs</h3>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {weightLogs.slice().reverse().map((log, index) => (
                <div key={index} className="flex justify-between items-center bg-card/50 border border-card/60 p-3 rounded-xl hover:border-gray-700 transition-all">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                    <Calendar size={14} className="text-primary" />
                    <span>{new Date(log.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <span className="text-xs font-black text-white">{log.weight} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Panel 2: BODY DIMENSIONS MEASUREMENTS */}
      {activeSubTab === 'measurements' && (
        <div className="animate-fade-in flex flex-col gap-5 mt-5">
          <form onSubmit={handleLogMeasurementsSubmit} className="bg-surface border border-card rounded-2xl p-4.5 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Log New Dimensions</h3>
            
            <div className="grid grid-cols-2 gap-3 mt-1.5">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Chest (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 104"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="w-full bg-card border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white text-center focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Waist (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 84"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full bg-card border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white text-center focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1 text-center">Arms (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 38"
                  value={arms}
                  onChange={(e) => setArms(e.target.value)}
                  className="w-full bg-card border border-gray-700/60 rounded-xl py-2 px-2 text-xs text-white text-center focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1 text-center">Legs (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 58"
                  value={legs}
                  onChange={(e) => setLegs(e.target.value)}
                  className="w-full bg-card border border-gray-700/60 rounded-xl py-2 px-2 text-xs text-white text-center focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1 text-center">Neck (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 39"
                  value={neck}
                  onChange={(e) => setNeck(e.target.value)}
                  className="w-full bg-card border border-gray-700/60 rounded-xl py-2 px-2 text-xs text-white text-center focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-dark transition-colors font-bold text-xs text-white rounded-xl text-center cursor-pointer shadow-[0_4px_12px_rgba(59,130,246,0.25)] mt-2"
            >
              Log Measurements
            </button>
          </form>

          {/* Historical measurements list */}
          <div className="bg-surface border border-card rounded-2xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 font-semibold">Dimensions Log</h3>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {measurementLogs.slice().reverse().map((log, index) => (
                <div key={index} className="bg-card/50 border border-card/60 p-3 rounded-xl flex flex-col gap-2 hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-gray-300">
                    <Calendar size={14} className="text-primary" />
                    <span>{new Date(log.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 text-[9px] font-bold text-gray-400 text-center">
                    {log.chest && <span>Chest: {log.chest}cm</span>}
                    {log.waist && <span>Waist: {log.waist}cm</span>}
                    {log.arms && <span>Arms: {log.arms}cm</span>}
                    {log.legs && <span>Legs: {log.legs}cm</span>}
                    {log.neck && <span>Neck: {log.neck}cm</span>}
                  </div>
                </div>
              ))}
              {measurementLogs.length === 0 && (
                <span className="text-[10px] text-gray-500 text-center py-2 font-semibold">No measurements logged yet.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Panel 3: STRENGTH PR RECORDS */}
      {activeSubTab === 'strength' && (
        <div className="animate-fade-in flex flex-col gap-4 mt-5">
          <div className="bg-surface border border-card rounded-2xl p-4.5 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 font-semibold">Personal Records (PRs)</h3>
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto no-scrollbar pr-1">
              {prsList.map((pr, index) => (
                <div key={index} className="flex justify-between items-center bg-card/50 border border-card/60 p-3.5 rounded-xl hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary/10 border border-primary/20 text-primary rounded-xl">
                      <Activity size={14} />
                    </div>
                    <span className="text-xs font-extrabold text-white">{pr.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-white">{pr.weight} kg</span>
                    <span className="text-[8px] text-gray-500 font-bold block mt-0.5 uppercase">Max Load</span>
                  </div>
                </div>
              ))}
              {prsList.length === 0 && (
                <span className="text-[10px] text-gray-500 text-center py-4 font-semibold">
                  Complete active workout sets to log strength personal records.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
