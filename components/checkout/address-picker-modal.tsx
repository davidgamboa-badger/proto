

'use client'

import { useState } from 'react'
import { X, MapPin, Plus, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SavedAddress } from '@/lib/checkout-types'

interface AddressPickerModalProps {
  isOpen: boolean
  onClose: () => void
  addresses: SavedAddress[]
  type: 'shipping' | 'billing'
  currentAddressId?: string
  onSelectAddress: (address: SavedAddress) => void
  onAddNew: () => void
}

export function AddressPickerModal({
  isOpen,
  onClose,
  addresses,
  type,
  currentAddressId,
  onSelectAddress,
  onAddNew
}: AddressPickerModalProps) {
  const filteredAddresses = addresses.filter(addr => addr.type === type || addr.type === 'shipping')
  
  const handleSelectAddress = (address: SavedAddress) => {
    onSelectAddress(address)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Select {type === 'shipping' ? 'Shipping' : 'Billing'} Address</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {/* Add New Address Button */}
            <button
              onClick={() => {
                onAddNew()
                onClose()
              }}
              className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900 group-hover:text-blue-600">
                    Add New Address
                  </p>
                  <p className="text-xs text-slate-600">
                    Create a new {type} address
                  </p>
                </div>
              </div>
            </button>

            {/* Saved Addresses */}
            {filteredAddresses.map((address) => (
              <button
                key={address.id}
                onClick={() => handleSelectAddress(address)}
                className={`w-full p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                  currentAddressId === address.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between space-x-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-slate-900">{address.fullName}</p>
                      {address.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    {address.company && (
                      <p className="text-sm text-slate-600">{address.company}</p>
                    )}
                    <p className="text-sm text-slate-700">{address.address}</p>
                    <p className="text-sm text-slate-700">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    {address.phone && (
                      <p className="text-xs text-slate-600">{address.phone}</p>
                    )}
                  </div>
                  {currentAddressId === address.id && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}

            {filteredAddresses.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No saved addresses yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
