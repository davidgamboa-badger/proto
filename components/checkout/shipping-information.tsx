
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck } from 'lucide-react'

interface ShippingInfo {
  fullName: string
  company?: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
}

interface ShippingInformationFormProps {
  data: ShippingInfo
  onChange: (data: ShippingInfo) => void
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

export function ShippingInformationForm({ data, onChange }: ShippingInformationFormProps) {
  const handleChange = (field: keyof ShippingInfo, value: string) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="w-5 h-5" />
          <span>Shipping Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={data.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              placeholder="Acme Manufacturing"
              value={data.company || ''}
              onChange={(e) => handleChange('company', e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
            <Input
              id="address"
              placeholder="123 Main Street"
              value={data.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
            <Input
              id="city"
              placeholder="San Francisco"
              value={data.city}
              onChange={(e) => handleChange('city', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
            <Select value={data.state} onValueChange={(value) => handleChange('state', value)}>
              <SelectTrigger id="state">
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
            <Label htmlFor="zipCode">Zip Code <span className="text-red-500">*</span></Label>
            <Input
              id="zipCode"
              placeholder="94102"
              value={data.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
            <Select value={data.country} onValueChange={(value) => handleChange('country', value)}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Mexico">Mexico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
