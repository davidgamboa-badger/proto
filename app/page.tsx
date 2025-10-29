
'use client'

import { useState, useEffect } from 'react'

import { QuoteSidebar } from '@/components/quote-sidebar'
import { PartsManager } from '@/components/parts-manager'
import { motion } from 'framer-motion'

interface Part {
  id: string
  name: string
  fileName?: string
  fileSize?: number
  thumbnailUrl?: string
  drawingFileName?: string
  drawingFileSize?: number
  currentStep: number
  selections: {
    process: string
    material: string
    surfaceFinish: string
    coating: string
    quantity: number
    leadTime: string
  }
}

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const [parts, setParts] = useState<Part[]>([])
  const [activePart, setActivePart] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Get Quote</h1>
              <p className="text-slate-600 mt-1">Upload parts and configure specifications to get instant quotes</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid grid-cols-1 ${parts.length > 0 ? 'lg:grid-cols-3' : ''} gap-8`}>
          {/* Main Content */}
          <div className={parts.length > 0 ? "lg:col-span-2" : ""}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Welcome/Getting Started Message - Show BEFORE PartsManager when no parts */}
              {parts.length === 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-10 mb-6 border-2 border-slate-200 max-w-5xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800 mb-3">Welcome to Get Quote</h3>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      Upload your 3D files or add parts manually to get started with custom manufacturing quotes
                    </p>
                  </div>

                  {/* Drag & Drop Area integrated into welcome card */}
                  <div
                    className={`border-3 border-dashed rounded-xl p-12 mb-8 transition-all duration-300 ${
                      dragOver
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-inner scale-[1.02]'
                        : 'border-slate-300 bg-gradient-to-br from-slate-50 to-blue-50 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragOver(false)
                      // Dispatch custom event with files
                      const event = new CustomEvent('filesDropped', { detail: e.dataTransfer.files })
                      window.dispatchEvent(event)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      setDragOver(false)
                    }}
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-slate-700 mb-2">
                        {dragOver ? 'Drop your files here' : 'Drag & Drop Your 3D Files'}
                      </h4>
                      <p className="text-slate-600 mb-4">
                        or click browse to select files from your computer
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            // Trigger file input from PartsManager
                            const event = new CustomEvent('triggerFileUpload')
                            window.dispatchEvent(event)
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                        >
                          Browse Files
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 mt-4">
                        Supports STL, STEP, OBJ, and more
                      </p>
                    </div>
                  </div>

                  {/* Process Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600">
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-100">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-md">
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-2 text-base">Upload Files</h4>
                      <p className="text-center text-slate-600">Add your 3D files or create parts manually</p>
                    </div>
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-100">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-md">
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-2 text-base">Configure Parts</h4>
                      <p className="text-center text-slate-600">Set materials, finishes, and specifications for each part</p>
                    </div>
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-100">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-md">
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-2 text-base">Get Quote</h4>
                      <p className="text-center text-slate-600">Review pricing and submit your quote request</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Parts Manager */}
              <PartsManager
                parts={parts}
                setParts={setParts}
                activePart={activePart}
                setActivePart={setActivePart}
                dragOver={dragOver}
                setDragOver={setDragOver}
              />
            </motion.div>
          </div>

          {/* Quote Sidebar - Only show when there are parts */}
          {parts.length > 0 && (
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="sticky top-24"
              >
                <QuoteSidebar 
                  selections={{}}
                  setSelections={() => {}}
                  parts={parts}
                  activePart={activePart}
                />
              </motion.div>
            </div>
          )}
        </div>
      </div>
      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
  Prototype Build 0.9
</span>

    </div>
  )
}
