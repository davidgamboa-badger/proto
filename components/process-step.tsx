
'use client'

import { motion } from 'framer-motion'
import { Settings, Zap, Wrench, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useRef } from 'react'

const processes = [
  {
    id: 'cnc',
    name: 'CNC Machining',
    icon: Settings,
    priceMultiplier: 1.0,
    leadTimeDays: 4,
  },
  {
    id: '3d-printing',
    name: '3D Printing',
    icon: Zap,
    priceMultiplier: 0.7,
    leadTimeDays: 2,
  },
  {
    id: 'sheet-metal',
    name: 'Sheet Metal',
    icon: Wrench,
    priceMultiplier: 0.8,
    leadTimeDays: 5,
  },
]

interface ProcessStepProps {
  selections: any
  setSelections: (selections: any) => void
  onNext?: () => void
}

export function ProcessStep({ selections, setSelections, onNext }: ProcessStepProps) {
  const shouldAutoAdvance = useRef(false)
  
  const handleProcessSelect = (processId: string) => {
    shouldAutoAdvance.current = true
    setSelections({ ...selections, process: processId })
  }

  // Auto-advance to next step after selection is saved
  useEffect(() => {
    if (shouldAutoAdvance.current && selections.process !== '' && onNext) {
      console.log('✅ Process selection saved, auto-advancing:', selections.process)
      shouldAutoAdvance.current = false
      onNext()
    }
  }, [selections.process, onNext])

  const canProceed = selections.process !== ''

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Manufacturing Process</h3>
        <p className="text-slate-600 text-sm">
          Choose the manufacturing method that best fits your requirements
        </p>
      </div>

      <div className="grid gap-2">
        {processes.map((process) => {
          const Icon = process.icon
          const isSelected = selections.process === process.id

          return (
            <motion.div
              key={process.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative"
            >
              <button
                onClick={() => {
                  handleProcessSelect(process.id)
                }}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-slate-900">
                      {process.name}
                    </h3>
                  </div>
                </div>
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
