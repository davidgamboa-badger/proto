

'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, AlertCircle, MapPin, CreditCard, Building, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckoutFormData, SavedAddress } from '@/lib/checkout-types'
import { CreditCardForm } from './credit-card-form'
import { PurchaseOrderForm } from './purchase-order-form'
import { AddressCard } from './address-card'
import { AddressPickerModal } from './address-picker-modal'

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
]

interface OrderSummaryProps {
  quoteData: any
  formData: CheckoutFormData
  submitting: boolean
  onSubmit: () => void
  onFormUpdate: (section: keyof CheckoutFormData, data: any) => void
}

export function OrderSummary({ quoteData, formData, submitting, onSubmit, onFormUpdate }: OrderSummaryProps) {
  const { shippingInfo, billingInfo, paymentMethod } = formData
  
  // Address management state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<SavedAddress | null>(null)
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<SavedAddress | null>(null)
  const [showShippingForm, setShowShippingForm] = useState(false)
  const [showBillingForm, setShowBillingForm] = useState(false)
  const [isShippingPickerOpen, setIsShippingPickerOpen] = useState(false)
  const [isBillingPickerOpen, setIsBillingPickerOpen] = useState(false)

  // Load saved addresses on mount
  useEffect(() => {
    loadSavedAddresses()
  }, [])

  const loadSavedAddresses = async () => {
    try {
      setLoadingAddresses(true)
      const response = await fetch('/api/user/addresses')
      const data = await response.json()
      
      if (data.success && data.addresses) {
        setSavedAddresses(data.addresses)
        
        // Auto-select default shipping address
        const defaultShipping = data.addresses.find(
          (addr: SavedAddress) => addr.type === 'shipping' && addr.isDefault
        )
        if (defaultShipping) {
          setSelectedShippingAddress(defaultShipping)
          populateFormWithAddress('shipping', defaultShipping)
        } else if (data.addresses.length === 0) {
          // No saved addresses - show form
          setShowShippingForm(true)
        }
      } else {
        // No saved addresses - show form
        setShowShippingForm(true)
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
      // On error, show form
      setShowShippingForm(true)
    } finally {
      setLoadingAddresses(false)
    }
  }

  const populateFormWithAddress = (type: 'shipping' | 'billing', address: SavedAddress) => {
    if (type === 'shipping') {
      onFormUpdate('shippingInfo', {
        fullName: address.fullName,
        company: address.company || '',
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone || '',
        email: address.email || ''
      })
    } else {
      onFormUpdate('billingInfo', {
        ...billingInfo,
        sameAsShipping: false,
        fullName: address.fullName,
        company: address.company || '',
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country
      })
    }
  }

  const handleEditShipping = () => {
    setShowShippingForm(true)
  }

  const handleEditBilling = () => {
    setShowBillingForm(true)
  }

  const handleUseDifferentShipping = () => {
    setIsShippingPickerOpen(true)
  }

  const handleUseDifferentBilling = () => {
    setIsBillingPickerOpen(true)
  }

  const handleSelectShippingAddress = (address: SavedAddress) => {
    setSelectedShippingAddress(address)
    populateFormWithAddress('shipping', address)
    setShowShippingForm(false)
  }

  const handleSelectBillingAddress = (address: SavedAddress) => {
    setSelectedBillingAddress(address)
    populateFormWithAddress('billing', address)
    setShowBillingForm(false)
  }

  const handleAddNewShippingAddress = () => {
    setSelectedShippingAddress(null)
    setShowShippingForm(true)
  }

  const handleAddNewBillingAddress = () => {
    setSelectedBillingAddress(null)
    setShowBillingForm(true)
  }

  const handleUseBillingInstead = () => {
    if (selectedShippingAddress) {
      setSelectedBillingAddress(selectedShippingAddress)
      populateFormWithAddress('billing', selectedShippingAddress)
      setShowBillingForm(false)
    }
  }

  const saveNewAddress = async (type: 'shipping' | 'billing') => {
    try {
      const addressData = type === 'shipping' ? shippingInfo : {
        fullName: billingInfo.fullName || '',
        company: billingInfo.company,
        address: billingInfo.address || '',
        city: billingInfo.city || '',
        state: billingInfo.state || '',
        zipCode: billingInfo.zipCode || '',
        country: billingInfo.country || ''
      }

      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addressData,
          type,
          isDefault: savedAddresses.filter(a => a.type === type).length === 0
        })
      })

      const data = await response.json()
      if (data.success && data.address) {
        setSavedAddresses([...savedAddresses, data.address])
        if (type === 'shipping') {
          setSelectedShippingAddress(data.address)
          setShowShippingForm(false)
        } else {
          setSelectedBillingAddress(data.address)
          setShowBillingForm(false)
        }
      }
    } catch (error) {
      console.error('Error saving address:', error)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Order Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">Order Total</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">
                  ${quoteData?.subtotal?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax (8.75%)</span>
                <span className="font-medium text-slate-900">
                  ${quoteData?.tax?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${quoteData?.total?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* Shipping Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Shipping Information</span>
            </h4>
            
            {loadingAddresses ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            ) : (
              <>
                {!showShippingForm && selectedShippingAddress ? (
                  <AddressCard
                    address={selectedShippingAddress}
                    type="shipping"
                    onEdit={handleEditShipping}
                    onUseDifferent={handleUseDifferentShipping}
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs">Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={shippingInfo.fullName}
                        onChange={(e) => onFormUpdate('shippingInfo', { ...shippingInfo, fullName: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="company" className="text-xs">Company (Optional)</Label>
                      <Input
                        id="company"
                        placeholder="Acme Inc."
                        value={shippingInfo.company || ''}
                        onChange={(e) => onFormUpdate('shippingInfo', { ...shippingInfo, company: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-xs">Address <span className="text-red-500">*</span></Label>
                      <Input
                        id="address"
                        placeholder="123 Main St, Apt 4"
                        value={shippingInfo.address}
                        onChange={(e) => onFormUpdate('shippingInfo', { ...shippingInfo, address: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="city" className="text-xs">City <span className="text-red-500">*</span></Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={shippingInfo.city}
                          onChange={(e) => onFormUpdate('shippingInfo', { ...shippingInfo, city: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="state" className="text-xs">State <span className="text-red-500">*</span></Label>
                        <Select
                          value={shippingInfo.state || 'placeholder'}
                          onValueChange={(value) => onFormUpdate('shippingInfo', { ...shippingInfo, state: value })}
                        >
                          <SelectTrigger id="state" className="h-9 text-sm">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="placeholder" disabled>Select state</SelectItem>
                            {US_STATES.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="zipCode" className="text-xs">ZIP Code <span className="text-red-500">*</span></Label>
                        <Input
                          id="zipCode"
                          placeholder="10001"
                          value={shippingInfo.zipCode}
                          onChange={(e) => onFormUpdate('shippingInfo', { ...shippingInfo, zipCode: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="country" className="text-xs">Country <span className="text-red-500">*</span></Label>
                        <Select
                          value={shippingInfo.country || 'United States'}
                          onValueChange={(value) => onFormUpdate('shippingInfo', { ...shippingInfo, country: value })}
                        >
                          <SelectTrigger id="country" className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="Mexico">Mexico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs">Phone <span className="text-red-500">*</span></Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={shippingInfo.phone}
                        onChange={(e) => onFormUpdate('shippingInfo', { ...shippingInfo, phone: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={shippingInfo.email}
                        onChange={(e) => onFormUpdate('shippingInfo', { ...shippingInfo, email: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                    {/* Option to save address */}
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox id="saveShipping" defaultChecked />
                      <Label htmlFor="saveShipping" className="text-xs text-slate-600 cursor-pointer">
                        Save this address for future orders
                      </Label>
                    </div>
                    {selectedShippingAddress && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowShippingForm(false)}
                        className="w-full text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="h-px bg-slate-200" />

          {/* Billing Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Billing Information</span>
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sameAsShipping"
                  checked={billingInfo.sameAsShipping}
                  onCheckedChange={(checked) => {
                    onFormUpdate('billingInfo', { ...billingInfo, sameAsShipping: checked as boolean })
                    setShowBillingForm(false)
                    setSelectedBillingAddress(null)
                  }}
                />
                <Label htmlFor="sameAsShipping" className="text-sm cursor-pointer">
                  Same as shipping address
                </Label>
              </div>

              {!billingInfo.sameAsShipping && (
                <>
                  {!showBillingForm && selectedBillingAddress ? (
                    <AddressCard
                      address={selectedBillingAddress}
                      type="billing"
                      onEdit={handleEditBilling}
                      onUseDifferent={handleUseDifferentBilling}
                      showUseBillingOption={!!selectedShippingAddress}
                      onUseBilling={handleUseBillingInstead}
                    />
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="billingFullName" className="text-xs">Full Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="billingFullName"
                          placeholder="John Doe"
                          value={billingInfo.fullName || ''}
                          onChange={(e) => onFormUpdate('billingInfo', { ...billingInfo, fullName: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="billingCompany" className="text-xs">Company (Optional)</Label>
                        <Input
                          id="billingCompany"
                          placeholder="Acme Inc."
                          value={billingInfo.company || ''}
                          onChange={(e) => onFormUpdate('billingInfo', { ...billingInfo, company: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="billingAddress" className="text-xs">Address <span className="text-red-500">*</span></Label>
                        <Input
                          id="billingAddress"
                          placeholder="123 Main St, Apt 4"
                          value={billingInfo.address || ''}
                          onChange={(e) => onFormUpdate('billingInfo', { ...billingInfo, address: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="billingCity" className="text-xs">City <span className="text-red-500">*</span></Label>
                          <Input
                            id="billingCity"
                            placeholder="New York"
                            value={billingInfo.city || ''}
                            onChange={(e) => onFormUpdate('billingInfo', { ...billingInfo, city: e.target.value })}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="billingState" className="text-xs">State <span className="text-red-500">*</span></Label>
                          <Select
                            value={billingInfo.state || 'placeholder'}
                            onValueChange={(value) => onFormUpdate('billingInfo', { ...billingInfo, state: value })}
                          >
                            <SelectTrigger id="billingState" className="h-9 text-sm">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="placeholder" disabled>Select state</SelectItem>
                              {US_STATES.map((state) => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="billingZipCode" className="text-xs">ZIP Code <span className="text-red-500">*</span></Label>
                          <Input
                            id="billingZipCode"
                            placeholder="10001"
                            value={billingInfo.zipCode || ''}
                            onChange={(e) => onFormUpdate('billingInfo', { ...billingInfo, zipCode: e.target.value })}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="billingCountry" className="text-xs">Country <span className="text-red-500">*</span></Label>
                          <Select
                            value={billingInfo.country || 'United States'}
                            onValueChange={(value) => onFormUpdate('billingInfo', { ...billingInfo, country: value })}
                          >
                            <SelectTrigger id="billingCountry" className="h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Mexico">Mexico</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Option to save address */}
                      <div className="flex items-center space-x-2">
                        <Checkbox id="saveBilling" defaultChecked />
                        <Label htmlFor="saveBilling" className="text-xs text-slate-600 cursor-pointer">
                          Save this address for future orders
                        </Label>
                      </div>
                      {selectedBillingAddress && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowBillingForm(false)}
                          className="w-full text-xs"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* Payment Method Form */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Payment Method</span>
            </h4>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => onFormUpdate('paymentMethod', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Credit Card</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="purchase_order"
                    checked={paymentMethod === 'purchase_order'}
                    onChange={(e) => onFormUpdate('paymentMethod', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Purchase Order</span>
                </label>
              </div>

              {paymentMethod === 'credit_card' && (
                <CreditCardForm
                  data={formData.creditCardInfo}
                  onChange={(data) => onFormUpdate('creditCardInfo', data)}
                />
              )}

              {paymentMethod === 'purchase_order' && (
                <PurchaseOrderForm
                  data={formData.purchaseOrderInfo}
                  onChange={(data) => onFormUpdate('purchaseOrderInfo', data)}
                />
              )}
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* Info Alert */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              Your order will automatically include a Material Certificate and Certificate of Conformance
            </AlertDescription>
          </Alert>

          {/* Action Button */}
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            size="lg"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Complete Checkout
              </>
            )}
          </Button>

          <p className="text-xs text-center text-slate-500">
            By placing this order, you agree to our Terms and Conditions
          </p>
        </CardContent>
      </Card>

      {/* Address Picker Modals */}
      <AddressPickerModal
        isOpen={isShippingPickerOpen}
        onClose={() => setIsShippingPickerOpen(false)}
        addresses={savedAddresses}
        type="shipping"
        currentAddressId={selectedShippingAddress?.id}
        onSelectAddress={handleSelectShippingAddress}
        onAddNew={handleAddNewShippingAddress}
      />

      <AddressPickerModal
        isOpen={isBillingPickerOpen}
        onClose={() => setIsBillingPickerOpen(false)}
        addresses={savedAddresses}
        type="billing"
        currentAddressId={selectedBillingAddress?.id}
        onSelectAddress={handleSelectBillingAddress}
        onAddNew={handleAddNewBillingAddress}
      />
    </>
  )
}
