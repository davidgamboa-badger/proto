
'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreditCardInfo {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
}

interface CreditCardFormProps {
  data?: CreditCardInfo
  onChange: (data: CreditCardInfo) => void
}

export function CreditCardForm({ data, onChange }: CreditCardFormProps) {
  const formData = data || {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  }

  const handleChange = (field: keyof CreditCardInfo, value: string) => {
    onChange({
      ...formData,
      [field]: value
    })
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const matches = cleaned.match(/.{1,4}/g)
    return matches ? matches.join(' ') : cleaned
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="cardholderName">Cardholder Name <span className="text-red-500">*</span></Label>
        <Input
          id="cardholderName"
          placeholder="John Doe"
          value={formData.cardholderName}
          onChange={(e) => handleChange('cardholderName', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="cardNumber">Card Number <span className="text-red-500">*</span></Label>
        <Input
          id="cardNumber"
          placeholder="1234 5678 9012 3456"
          value={formData.cardNumber}
          onChange={(e) => {
            const formatted = formatCardNumber(e.target.value)
            if (formatted.replace(/\s/g, '').length <= 16) {
              handleChange('cardNumber', formatted)
            }
          }}
          maxLength={19}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiryDate">Expiry Date <span className="text-red-500">*</span></Label>
        <Input
          id="expiryDate"
          placeholder="MM/YY"
          value={formData.expiryDate}
          onChange={(e) => {
            const formatted = formatExpiryDate(e.target.value)
            if (formatted.replace(/\D/g, '').length <= 4) {
              handleChange('expiryDate', formatted)
            }
          }}
          maxLength={5}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cvv">CVV <span className="text-red-500">*</span></Label>
        <Input
          id="cvv"
          type="password"
          placeholder="123"
          value={formData.cvv}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '')
            if (value.length <= 4) {
              handleChange('cvv', value)
            }
          }}
          maxLength={4}
          required
        />
      </div>

      <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900">
          <strong>Secure Payment:</strong> Your payment information is encrypted and secure. 
          We never store your full credit card details.
        </p>
      </div>
    </div>
  )
}
