
'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Sparkles, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRef, useEffect } from 'react'

const surfaceFinishes = [
  {
    id: 'as-machined',
    name: 'As Machined',
    icon: Sparkles,
    priceMultiplier: 1.0,
    popular: true,
  },
  {
    id: 'bead-blast',
    name: 'Bead Blasted',
    icon: Zap,
    priceMultiplier: 1.2,
    popular: true,
  },
  {
    id: 'brushed',
    name: 'Brushed',
    icon: Star,
    priceMultiplier: 1.4,
    popular: true,
  },
  {
    id: 'anodized',
    name: 'Anodized',
    icon: Sparkles,
    priceMultiplier: 1.8,
    materialRestriction: 'aluminum',
    popular: true,
  },
  {
    id: 'polished',
    name: 'Polished',
    icon: Star,
    priceMultiplier: 2.5,
    popular: false,
  },
  {
    id: 'sandblasted',
    name: 'Sandblasted',
    icon: Zap,
    priceMultiplier: 1.3,
    popular: false,
  },
  {
    id: 'tumbled',
    name: 'Tumbled',
    icon: Sparkles,
    priceMultiplier: 1.1,
    popular: false,
  },
  {
    id: 'passivated',
    name: 'Passivated',
    icon: Star,
    priceMultiplier: 1.6,
    materialRestriction: 'stainless',
    popular: false,
  },
]

interface SurfaceFinishStepProps {
  selections: any
  setSelections: (selections: any) => void
  onNext?: () => void
  onPrev?: () => void
}

export function SurfaceFinishStep({ selections, setSelections, onNext, onPrev }: SurfaceFinishStepProps) {
  const shouldAutoAdvance = useRef(false)
  
  const handleFinishSelect = (finishId: string) => {
    shouldAutoAdvance.current = true
    setSelections({ ...selections, surfaceFinish: finishId })
  }

  // Auto-advance to next step after selection is saved
  useEffect(() => {
    if (shouldAutoAdvance.current && selections.surfaceFinish !== '' && onNext) {
      console.log('✅ Surface finish selection saved, auto-advancing:', selections.surfaceFinish)
      shouldAutoAdvance.current = false
      onNext()
    }
  }, [selections.surfaceFinish, onNext])

  const canProceed = selections.surfaceFinish !== ''
  const isAluminumMaterial = selections.material?.includes('6061') || selections.material?.includes('7075') || selections.material?.includes('aluminum')
  const isStainlessMaterial = selections.material?.includes('stainless') || selections.material?.includes('304') || selections.material?.includes('316')
  
  const availableFinishes = surfaceFinishes.filter(finish => 
    !finish.materialRestriction || 
    (finish.materialRestriction === 'aluminum' && isAluminumMaterial) ||
    (finish.materialRestriction === 'stainless' && isStainlessMaterial)
  )

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Surface Finish</h3>
        <p className="text-slate-600 text-sm">
          Define how your part will look and feel
        </p>
      </div>

      {/* Popular Surface Finishes Section */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Popular Choices</h4>
        <div className="grid gap-1">
          {availableFinishes.filter(f => f.popular).map((finish) => {
            const Icon = finish.icon
            const isSelected = selections.surfaceFinish === finish.id

            return (
              <motion.div
                key={finish.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="relative"
              >
                <button
                  onClick={() => {
                    handleFinishSelect(finish.id)
                  }}
                  className={`w-full text-left p-2 rounded-lg border-2 transition-all duration-300 ${
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
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-slate-900">
                        {finish.name}
                      </h3>
                    </div>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Popular
                    </div>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Other Surface Finishes Section */}
      {availableFinishes.filter(f => !f.popular).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Other Surface Finishes</h4>
          <div className="grid gap-1">
            {availableFinishes.filter(f => !f.popular).map((finish) => {
              const Icon = finish.icon
              const isSelected = selections.surfaceFinish === finish.id

              return (
                <motion.div
                  key={finish.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="relative"
                >
                  <button
                    onClick={() => {
                      handleFinishSelect(finish.id)
                    }}
                    className={`w-full text-left p-2 rounded-lg border-2 transition-all duration-300 ${
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
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-slate-900">
                          {finish.name}
                        </h3>
                      </div>
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
