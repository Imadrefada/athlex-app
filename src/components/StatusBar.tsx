import { useState, useEffect } from 'react'
import { Wifi } from 'lucide-react'

export default function StatusBar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      let hours = now.getHours()
      const minutes = now.getMinutes().toString().padStart(2, '0')
      // Format 12-hour or 24-hour. Let's use 24-hour style
      setTime(`${hours}:${minutes}`)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex justify-between items-center px-6 py-2.5 bg-bg-main text-white select-none z-50 text-[12px] font-semibold border-b border-surface/50 h-[38px]">
      {/* Time */}
      <div>{time}</div>
      
      {/* Status Icons */}
      <div className="flex items-center gap-1.5">
        {/* Cellular Signal Icons */}
        <div className="flex items-end gap-[1.5px] h-2.5">
          <div className="w-[2.5px] h-[3px] bg-white rounded-[0.5px]"></div>
          <div className="w-[2.5px] h-[5px] bg-white rounded-[0.5px]"></div>
          <div className="w-[2.5px] h-[7px] bg-white rounded-[0.5px]"></div>
          <div className="w-[2.5px] h-[9px] bg-white/40 rounded-[0.5px]"></div>
          <div className="w-[2.5px] h-[11px] bg-white/40 rounded-[0.5px]"></div>
        </div>
        
        {/* Wifi Icon */}
        <Wifi size={13} className="text-white" />
        
        {/* Battery Icon */}
        <div className="flex items-center gap-[1px]">
          <div className="w-5 h-2.5 border border-white/60 rounded-[3px] p-[1px] flex items-center">
            <div className="h-full w-[85%] bg-success rounded-[1px]"></div>
          </div>
          <div className="w-[1.5px] h-[3px] bg-white/60 rounded-r-[0.5px]"></div>
        </div>
      </div>
    </div>
  )
}
