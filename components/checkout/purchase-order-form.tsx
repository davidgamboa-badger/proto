
'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface PurchaseOrderInfo {
  poNumber: string
  notes?: string
}

interface PurchaseOrderFormProps {
  data?: PurchaseOrderInfo
  onChange: (data: PurchaseOrderInfo) => void
}

export function PurchaseOrderForm({ data, onChange }: PurchaseOrderFormProps) {
  const formData = data || {
    poNumber: '',
    notes: ''
  }

  const handleChange = (field: keyof PurchaseOrderInfo, value: string) => {
    onChange({
      ...formData,
      [field]: value
    })
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="poNumber">Purchase Order Number <span className="text-red-500">*</span></Label>
        <Input
          id="poNumber"
          placeholder="PO-2024-12345"
          value={formData.poNumber}
          onChange={(e) => handleChange('poNumber', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="poNotes">Additional Notes (Optional)</Label>
        <Textarea
          id="poNotes"
          placeholder="Enter any special instructions or notes for this purchase order..."
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
        />
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-900">
          <strong>Note:</strong> Orders paid by purchase order are subject to credit approval 
          and may require additional documentation. Net payment terms apply.
        </p>
      </div>
    </div>
  )
}
