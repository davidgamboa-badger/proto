

'use client'

import { useState } from 'react'
import { MapPin, Edit, Repeat, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SavedAddress } from '@/lib/checkout-types'

interface AddressCardProps {
  address: SavedAddress
  type: 'shipping' | 'billing'
  onEdit: () => void
  onUseDifferent: () => void
  showUseBillingOption?: boolean
  onUseBilling?: () => void
}

export function AddressCard({ 
  address, 
  type, 
  onEdit, 
  onUseDifferent,
  showUseBillingOption = false,
  onUseBilling
}: AddressCardProps) {
  return (
    <div className="border border-slate-200 rounded-lg bg-slate-50/50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-slate-600" />
          <h5 className="text-sm font-semibold text-slate-900 capitalize">
            {type} Address
          </h5>
        </div>
        <Badge variant="secondary" className="flex items-center space-x-1 text-xs">
          <Lock className="w-3 h-3" />
          <span>Saved</span>
        </Badge>
      </div>

      {/* Address Content */}
      <div className="space-y-1 text-sm">
        <p className="font-medium text-slate-900">
          {address.fullName}
          {address.company && <span className="text-slate-600"> • {address.company}</span>}
        </p>
        <p className="text-slate-700">{address.address}</p>
        <p className="text-slate-700">
          {address.city}, {address.state} {address.zipCode}
        </p>
        <p className="text-slate-700">{address.country}</p>
        {address.phone && (
          <p className="text-slate-600">Phone: {address.phone}</p>
        )}
        {address.email && (
          <p className="text-slate-600">Email: {address.email}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col space-y-2 pt-2">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 h-8 text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onUseDifferent}
            className="flex-1 h-8 text-xs"
          >
            <Repeat className="w-3 h-3 mr-1" />
            Use Different
          </Button>
        </div>
        {showUseBillingOption && onUseBilling && (
          <button
            onClick={onUseBilling}
            className="text-xs text-blue-600 hover:text-blue-700 hover:underline text-left"
          >
            Use shipping address instead
          </button>
        )}
      </div>
    </div>
  )
}
