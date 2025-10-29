
'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Zap, Shield, Wrench, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const materials = [
  {
    id: '6061',
    name: 'Aluminum 6061',
    category: 'aluminum',
    icon: Zap,
    priceMultiplier: 1.0,
    popular: true,
    description: 'Excellent workability and corrosion resistance',
  },
  {
    id: '7075',
    name: 'Aluminum 7075',
    category: 'aluminum',
    icon: Zap,
    priceMultiplier: 1.2,
    popular: true,
    description: 'High strength aerospace grade aluminum',
  },
  {
    id: '304-stainless',
    name: '304 Stainless Steel',
    category: 'stainless-steel',
    icon: Shield,
    priceMultiplier: 1.3,
    popular: true,
    description: 'Standard corrosion resistant steel',
  },
  {
    id: '316-stainless',
    name: '316 Stainless Steel',
    category: 'stainless-steel',
    icon: Shield,
    priceMultiplier: 1.5,
    popular: true,
    description: 'Superior corrosion resistance',
  },
  {
    id: 'abs',
    name: 'ABS Plastic',
    category: 'plastics',
    icon: Wrench,
    priceMultiplier: 0.4,
    popular: true,
    description: 'Durable thermoplastic with good impact resistance',
  },
  {
    id: 'pla',
    name: 'PLA Plastic',
    category: 'plastics',
    icon: Wrench,
    priceMultiplier: 0.3,
    popular: true,
    description: 'Easy to machine, biodegradable option',
  },
  {
    id: 'delrin',
    name: 'Delrin (POM)',
    category: 'plastics',
    icon: Wrench,
    priceMultiplier: 0.8,
    popular: false,
    description: 'High precision plastic with low friction',
  },
  {
    id: 'nylon',
    name: 'Nylon PA6',
    category: 'plastics',
    icon: Wrench,
    priceMultiplier: 0.6,
    popular: false,
    description: 'Strong, flexible engineering plastic',
  },
  {
    id: 'peek',
    name: 'PEEK',
    category: 'plastics',
    icon: Shield,
    priceMultiplier: 8.0,
    popular: false,
    description: 'High-performance engineering thermoplastic',
  },
  {
    id: 'brass',
    name: 'Brass',
    category: 'metals',
    icon: Shield,
    priceMultiplier: 1.6,
    popular: false,
    description: 'Corrosion resistant with antimicrobial properties',
  },
  {
    id: 'copper',
    name: 'Copper',
    category: 'metals',
    icon: Zap,
    priceMultiplier: 1.8,
    popular: false,
    description: 'Excellent electrical and thermal conductivity',
  },
  {
    id: 'titanium',
    name: 'Titanium Grade 2',
    category: 'metals',
    icon: Shield,
    priceMultiplier: 4.5,
    popular: false,
    description: 'Lightweight with exceptional strength-to-weight ratio',
  },
]

const materialCategories = [
  { id: 'all', name: 'All Materials', icon: Wrench },
  { id: 'aluminum', name: 'Aluminum', icon: Zap },
  { id: 'stainless-steel', name: 'Stainless Steel', icon: Shield },
  { id: 'plastics', name: 'Plastics', icon: Wrench },
  { id: 'metals', name: 'Metals', icon: Shield },
]

interface MaterialStepProps {
  selections: any
  setSelections: (selections: any) => void
  onNext?: () => void
  onPrev?: () => void
}

export function MaterialStep({ selections, setSelections, onNext, onPrev }: MaterialStepProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const shouldAutoAdvance = useRef(false)

  const handleMaterialSelect = (materialId: string) => {
    shouldAutoAdvance.current = true
    setSelections({ ...selections, material: materialId })
  }

  // Auto-advance to next step after selection is saved
  useEffect(() => {
    if (shouldAutoAdvance.current && selections.material !== '' && onNext) {
      console.log('✅ Material selection saved, auto-advancing:', selections.material)
      shouldAutoAdvance.current = false
      onNext()
    }
  }, [selections.material, onNext])

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSearchQuery('') // Clear search when changing category
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  // Filter materials based on search and category
  const filteredMaterials = useMemo(() => {
    let filtered = materials

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => material.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(query) ||
        material.description.toLowerCase().includes(query) ||
        material.category.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [searchQuery, selectedCategory])

  // Get popular materials within the filtered results
  const popularMaterials = filteredMaterials.filter(m => m.popular)
  const otherMaterials = filteredMaterials.filter(m => !m.popular)

  const canProceed = selections.material !== ''

  const renderMaterialCard = (material: any) => {
    const Icon = material.icon
    const isSelected = selections.material === material.id

    return (
      <motion.div
        key={material.id}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="relative"
        layout
      >
        <button
          onClick={() => {
            handleMaterialSelect(material.id)
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
                {material.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {material.description}
              </p>
            </div>
            {material.popular && (
              <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Popular
              </div>
            )}
          </div>
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Material Selection</h3>
        <p className="text-slate-600 text-sm">
          Choose the material that matches your performance requirements
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-10 text-sm"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-slate-700">Filter by Material Type</h4>
        <div className="flex flex-wrap gap-1">
          {materialCategories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            const categoryCount = category.id === 'all' 
              ? materials.length 
              : materials.filter(m => m.category === category.id).length

            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategorySelect(category.id)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-xs font-medium transition-all duration-300 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{category.name}</span>
                <span className={`px-1 py-0.5 text-xs rounded-full ${
                  isSelected
                    ? 'bg-blue-200 text-blue-700'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {categoryCount}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Results */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-8">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-slate-600 mb-1">No materials found</h4>
          <p className="text-xs text-slate-500 mb-3">Try adjusting your search or filter criteria</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Popular Materials Section */}
          {popularMaterials.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">
                {selectedCategory === 'all' ? 'Popular Choices' : `Popular ${materialCategories.find(c => c.id === selectedCategory)?.name || ''}`}
              </h4>
              <motion.div layout className="grid gap-1">
                {popularMaterials.map(renderMaterialCard)}
              </motion.div>
            </div>
          )}

          {/* Other Materials Section */}
          {otherMaterials.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">
                {selectedCategory === 'all' ? 'Other Materials' : `All ${materialCategories.find(c => c.id === selectedCategory)?.name || ''}`}
              </h4>
              <motion.div layout className="grid gap-1">
                {otherMaterials.map(renderMaterialCard)}
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
