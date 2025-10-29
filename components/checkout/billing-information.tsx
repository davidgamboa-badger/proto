
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CreditCard } from 'lucide-react'

interface BillingInfo {
  sameAsShipping: boolean
  fullName?: string
  company?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

interface ShippingInfo {
  fullName: string
  company?: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface BillingInformationFormProps {
  data: BillingInfo
  shippingInfo: ShippingInfo
  onChange: (data: BillingInfo) => void
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
]

export function BillingInformationForm({ data, shippingInfo, onChange }: BillingInformationFormProps) {
  const handleChange = (field: keyof BillingInfo, value: string) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  const toggleSameAsShipping = (checked: boolean) => {
    onChange({
      ...data,
      sameAsShipping: checked
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Billing Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Same as Shipping Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameAsShipping"
              checked={data.sameAsShipping}
              onCheckedChange={toggleSameAsShipping}
            />
            <Label htmlFor="sameAsShipping" className="cursor-pointer">
              Same as shipping address
            </Label>
          </div>

          {/* Show billing form only if different from shipping */}
          {!data.sameAsShipping && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="billingFullName">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="billingFullName"
                  placeholder="John Doe"
                  value={data.fullName || ''}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingCompany">Company (Optional)</Label>
                <Input
                  id="billingCompany"
                  placeholder="Acme Manufacturing"
                  value={data.company || ''}
                  onChange={(e) => handleChange('company', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="billingAddress">Address <span className="text-red-500">*</span></Label>
                <Input
                  id="billingAddress"
                  placeholder="123 Main Street"
                  value={data.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingCity">City <span className="text-red-500">*</span></Label>
                <Input
                  id="billingCity"
                  placeholder="San Francisco"
                  value={data.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingState">State <span className="text-red-500">*</span></Label>
                <Select value={data.state || ''} onValueChange={(value) => handleChange('state', value)}>
                  <SelectTrigger id="billingState">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingZipCode">Zip Code <span className="text-red-500">*</span></Label>
                <Input
                  id="billingZipCode"
                  placeholder="94102"
                  value={data.zipCode || ''}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingCountry">Country <span className="text-red-500">*</span></Label>
                <Select value={data.country || ''} onValueChange={(value) => handleChange('country', value)}>
                  <SelectTrigger id="billingCountry">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Mexico">Mexico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {data.sameAsShipping && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Billing address:</p>
              <p className="text-sm font-medium text-slate-900">
                {shippingInfo.fullName}
                {shippingInfo.company && <>, {shippingInfo.company}</>}
              </p>
              <p className="text-sm text-slate-700">{shippingInfo.address}</p>
              <p className="text-sm text-slate-700">
                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
              </p>
              <p className="text-sm text-slate-700">{shippingInfo.country}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
