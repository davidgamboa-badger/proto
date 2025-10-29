
'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Shield, ShieldCheck, Palette, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const coatings = [
  {
    id: 'none',
    name: 'No Coating',
    icon: X,
    priceMultiplier: 1.0,
    popular: true,
  },
  {
    id: 'clear-anodize',
    name: 'Clear Anodize',
    icon: Shield,
    priceMultiplier: 1.4,
    materialRestriction: 'aluminum',
    popular: true,
  },
  {
    id: 'black-anodize',
    name: 'Black Anodize',
    icon: Palette,
    priceMultiplier: 1.6,
    materialRestriction: 'aluminum',
    popular: true,
  },
  {
    id: 'powder-coat',
    name: 'Powder Coating',
    icon: ShieldCheck,
    priceMultiplier: 1.8,
    popular: true,
  },
  {
    id: 'zinc-plate',
    name: 'Zinc Plating',
    icon: Shield,
    priceMultiplier: 1.5,
    popular: true,
  },
  {
    id: 'nickel-plate',
    name: 'Nickel Plating',
    icon: Shield,
    priceMultiplier: 2.2,
    popular: false,
  },
  {
    id: 'chrome-plate',
    name: 'Chrome Plating',
    icon: ShieldCheck,
    priceMultiplier: 2.8,
    popular: false,
  },
  {
    id: 'gold-plate',
    name: 'Gold Plating',
    icon: Palette,
    priceMultiplier: 5.0,
    popular: false,
  },
  {
    id: 'teflon-coat',
    name: 'Teflon Coating',
    icon: Shield,
    priceMultiplier: 3.2,
    popular: false,
  },
]

interface CoatingStepProps {
  selections: any
  setSelections: (selections: any) => void
  onNext?: () => void
  onPrev?: () => void
}

export function CoatingStep({ selections, setSelections, onNext, onPrev }: CoatingStepProps) {
  const handleCoatingSelect = (coatingId: string) => {
    setSelections({ ...selections, coating: coatingId })
    // Don't call onNext - coating is the last configuration step
    // The scroll to Quantity & Lead Time will be handled by the parent
  }

  const isAluminumMaterial = selections.material?.includes('6061') || selections.material?.includes('aluminum')
  
  const availableCoatings = coatings.filter(coating => 
    !coating.materialRestriction || 
    (coating.materialRestriction === 'aluminum' && isAluminumMaterial)
  )

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Coatings & Protection</h3>
        <p className="text-slate-600 text-sm">
          Add protective coatings to enhance durability and appearance
        </p>
      </div>

      {/* Popular Coatings Section */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Popular Choices</h4>
        <div className="grid gap-1">
          {availableCoatings.filter(c => c.popular).map((coating) => {
            const Icon = coating.icon
            const isSelected = selections.coating === coating.id

            return (
              <motion.div
                key={coating.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="relative"
              >
                <button
                  onClick={() => handleCoatingSelect(coating.id)}
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
                        {coating.name}
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

      {/* Other Coatings Section */}
      {availableCoatings.filter(c => !c.popular).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Specialty Coatings</h4>
          <div className="grid gap-1">
            {availableCoatings.filter(c => !c.popular).map((coating) => {
              const Icon = coating.icon
              const isSelected = selections.coating === coating.id

              return (
                <motion.div
                  key={coating.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="relative"
                >
                  <button
                    onClick={() => handleCoatingSelect(coating.id)}
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
                          {coating.name}
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
