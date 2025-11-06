'use client'
import { calculatePartPrice, isPartConfigured } from '@/lib/pricing'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Edit, Upload, File, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Part } from "@/lib/pricing";

interface PartAttachment {
  id: string
  fileName: string
  fileSize: number
  uploadedAt: string
}


const toPricingKeys = {
  process: {
    'CNC Machining': 'cnc',
    '3D Printing': '3d-printing',
    'Sheet Metal': 'sheet-metal',
  },
  material: {
    'Aluminum 6061': '6061',
    'Aluminum 7075': '7075',
    '304 Stainless': '304-stainless',
    '316 Stainless': '316-stainless',
    ABS: 'abs',
    PLA: 'pla',
    Brass: 'brass',
    Copper: 'copper',
    Titanium: 'titanium',
    Delrin: 'delrin',
    Nylon: 'nylon',
    PEEK: 'peek',
  },
  surfaceFinish: {
    'As Machined': 'as-machined',
    'Bead Blasted': 'bead-blast',
    Brushed: 'brushed',
    Anodized: 'anodized',
    Polished: 'polished',
    Sandblasted: 'sandblasted',
    Tumbled: 'tumbled',
    Passivated: 'passivated',
  },
  coating: {
    None: 'none',
    'Clear Anodize': 'clear-anodize',
    'Black Anodize': 'black-anodize',
    'Powder Coat': 'powder-coat',
    'Zinc Plate': 'zinc-plate',
    'Nickel Plate': 'nickel-plate',
    'Chrome Plate': 'chrome-plate',
    'Gold Plate': 'gold-plate',
    'Teflon Coat': 'teflon-coat',
  },
} as const;

function leadTimeToShipDateLabel(leadTime: string | number): string {
  // Simple label; replace with real date math later
  switch (String(leadTime)) {
    case '1': return 'Ships in 1 day';
    case '2': return 'Ships in 2 days';
    case '3': return 'Ships in 3 days';
    case '5': return 'Ships in 5 days';
    case '7': return 'Ships in 7 days';
    default:  return 'Ships soon';
  }
}


function normalizePartForPricing(part: Part): Part {
  const s = part.selections;
  return {
    ...part,
    selections: {
      ...s,
      process: (toPricingKeys.process as any)[s.process] ?? s.process,
      material: (toPricingKeys.material as any)[s.material] ?? s.material,
      surfaceFinish: (toPricingKeys.surfaceFinish as any)[s.surfaceFinish] ?? s.surfaceFinish,
      coating: (toPricingKeys.coating as any)[s.coating] ?? s.coating,
      quantity: s.quantity || 1, // guard
    },
  };
}


interface CheckoutPartsReviewProps {
  quoteId: string
  onEditQuote: () => void
  parts: Part[]                      // <-- NEW: drive UI from props
  onPartsChange?: (parts: Part[]) => void // <-- NEW: bubble edits up (attachments)
}

const displayNames = {
  process: 'Manufacturing Process',
  material: 'Material',
  surfaceFinish: 'Surface Finish',
  coating: 'Coating'
}

export function CheckoutPartsReview({
  quoteId,
  onEditQuote,
  parts,
  onPartsChange,
}: CheckoutPartsReviewProps) {
  const [uploadingPartId, setUploadingPartId] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleFileUpload = async (partId: string, file: File) => {
    setUploadingPartId(partId)
    try {
      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'image/svg+xml', 'application/dxf']
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PNG, JPG, PDF, SVG, or DXF files.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10 MB limit.')
        return
      }

      // Mock upload; replace with API
      await new Promise(resolve => setTimeout(resolve, 800))

      const newAttachment: PartAttachment = {
        id: `${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString()
      }

      const next = parts.map(p =>
        p.id === partId
          ? { ...p, attachments: [...(p.attachments ?? []), newAttachment] }
          : p
      )
      onPartsChange?.(next)
    } finally {
      setUploadingPartId(null)
    }
  }

  const handleRemoveAttachment = (partId: string, attachmentId: string) => {
    const next = parts.map(p =>
      p.id === partId
        ? { ...p, attachments: (p.attachments ?? []).filter(a => a.id !== attachmentId) }
        : p
    )
    onPartsChange?.(next)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Parts Review</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onEditQuote} className="flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit Quote</span>
          </Button>
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Review your parts and upload 2D drawings if needed
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {parts.map((part, index) => {

const normalized = normalizePartForPricing(part);
const partPrice = isPartConfigured(normalized as Part)
  ? calculatePartPrice(normalized)
  : undefined;
        return (
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
                    <p className="text-sm text-slate-600">
                      {part.fileName} • {formatFileSize(part.fileSize || 0)}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onEditQuote} className="text-blue-600 hover:text-blue-700">
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
                    <span className="text-sm font-medium text-slate-900">{String(value)}</span>
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
                <p className="text-sm font-semibold text-slate-900">  {part.estimatedShipDate ?? leadTimeToShipDateLabel(part.selections.leadTime)}
</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Total Cost</span>
                <p className="text-sm font-semibold text-blue-600">
{typeof partPrice === 'number' ? `$${partPrice.toFixed(2)}` : '—'}
                  </p>
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
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
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

              <p className="text-xs text-slate-500">Supported formats: PNG, JPG, PDF, SVG, DXF (Max 10 MB)</p>
            </div>
          </div>
        )})}

        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-sm text-amber-900">
            <strong>Note:</strong> Parts cannot be added or 3D files cannot be uploaded during checkout.
            Click &quot;Edit Quote&quot; to modify your parts configuration.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
