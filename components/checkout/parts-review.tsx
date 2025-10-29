
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Edit, Upload, File, X, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PartAttachment {
  id: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

interface Part {
  id: string
  name: string
  fileName?: string
  fileSize?: number
  attachments?: PartAttachment[]
  selections: {
    process: string
    material: string
    surfaceFinish: string
    coating: string
    quantity: number
    leadTime: string
  }
  estimatedPrice: number
  estimatedShipDate: string
}

interface CheckoutPartsReviewProps {
  quoteId: string
  onEditQuote: () => void
}

// Mock data - replace with actual data from API
const mockParts: Part[] = [
  {
    id: '1',
    name: 'Metal_Fuel_Fill_Fix',
    fileName: 'Metal_Fuel_Fill_Fix.step',
    fileSize: 27460,
    attachments: [],
    selections: {
      process: 'CNC Machining',
      material: 'Aluminum 6061',
      surfaceFinish: 'Bead Blasted',
      coating: 'Clear Anodize',
      quantity: 1,
      leadTime: '7'
    },
    estimatedPrice: 86.74,
    estimatedShipDate: 'September 18'
  }
]

const displayNames = {
  process: 'Manufacturing Process',
  material: 'Material',
  surfaceFinish: 'Surface Finish',
  coating: 'Coating'
}

export function CheckoutPartsReview({ quoteId, onEditQuote }: CheckoutPartsReviewProps) {
  const [parts, setParts] = useState<Part[]>(mockParts)
  const [uploadingPartId, setUploadingPartId] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleFileUpload = async (partId: string, file: File) => {
    setUploadingPartId(partId)
    
    try {
      // Validate file
      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'image/svg+xml', 'application/dxf']
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PNG, JPG, PDF, SVG, or DXF files.')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10 MB limit.')
        return
      }

      // Mock upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newAttachment: PartAttachment = {
        id: `${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString()
      }

      setParts(prev => prev.map(p => 
        p.id === partId 
          ? { ...p, attachments: [...(p.attachments || []), newAttachment] }
          : p
      ))
    } catch (error) {
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploadingPartId(null)
    }
  }

  const handleRemoveAttachment = (partId: string, attachmentId: string) => {
    setParts(prev => prev.map(p => 
      p.id === partId 
        ? { ...p, attachments: p.attachments?.filter(a => a.id !== attachmentId) }
        : p
    ))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Parts Review</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onEditQuote}
            className="flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Quote</span>
          </Button>
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Review your parts and upload 2D drawings if needed
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {parts.map((part, index) => (
          <div key={part.id} className="border border-slate-200 rounded-lg p-4">
            {/* Part Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{part.name}</h3>
                  {part.fileName && (
                    <p className="text-sm text-slate-600">{part.fileName} • {formatFileSize(part.fileSize || 0)}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditQuote}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>

            {/* Part Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {Object.entries(part.selections).map(([key, value]) => {
                if (key === 'quantity' || key === 'leadTime') return null
                return (
                  <div key={key} className="flex items-baseline space-x-2">
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {displayNames[key as keyof typeof displayNames] || key}:
                    </span>
                    <span className="text-sm font-medium text-slate-900">{value}</span>
                  </div>
                )
              })}
            </div>

            {/* Quantity and Shipping */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg mb-4">
              <div>
                <span className="text-xs text-slate-500">Quantity</span>
                <p className="text-sm font-semibold text-slate-900">{part.selections.quantity}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Est. Ship Date</span>
                <p className="text-sm font-semibold text-slate-900">{part.estimatedShipDate}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Total Cost</span>
                <p className="text-sm font-semibold text-blue-600">${part.estimatedPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* 2D File Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">2D Drawings (Optional)</label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    id={`file-upload-${part.id}`}
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.pdf,.svg,.dxf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(part.id, file)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                    disabled={uploadingPartId === part.id}
                    onClick={(e) => {
                      e.preventDefault()
                      const input = document.getElementById(`file-upload-${part.id}`) as HTMLInputElement
                      input?.click()
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploadingPartId === part.id ? 'Uploading...' : 'Upload File'}</span>
                  </Button>
                </label>
              </div>

              {/* Attachments List */}
              {part.attachments && part.attachments.length > 0 && (
                <div className="space-y-2">
                  {part.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <File className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-slate-900 truncate">{attachment.fileName}</span>
                        <span className="text-xs text-slate-500">({formatFileSize(attachment.fileSize)})</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(part.id, attachment.id)}
                        className="ml-2 text-red-600 hover:text-red-700 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-500">
                Supported formats: PNG, JPG, PDF, SVG, DXF (Max 10 MB)
              </p>
            </div>
          </div>
        ))}

        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-sm text-amber-900">
            <strong>Note:</strong> Parts cannot be added or 3D files cannot be uploaded during checkout. 
            Click "Edit Quote" to modify your parts configuration.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
