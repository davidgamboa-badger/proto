

// Checkout-specific types
export interface CheckoutFormData {
  shippingInfo: {
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
  billingInfo: {
    sameAsShipping: boolean
    fullName?: string
    company?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  creditCardInfo?: {
    cardNumber: string
    expiryDate: string
    cvv: string
    cardholderName: string
  }
  purchaseOrderInfo?: {
    poNumber: string
    notes?: string
  }
  paymentMethod: 'credit_card' | 'purchase_order'
}

export interface SavedAddress {
  id: string
  type: 'shipping' | 'billing'
  fullName: string
  company?: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  email?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface PartAttachment {
  id: string
  partId: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: string
  url: string
}

export interface QuoteData {
  id: string
  parts: Part[]
  additionalRequirements: string[]
  notes: string
  subtotal: number
  tax: number
  total: number
  createdAt: string
  updatedAt: string
}

export interface Part {
  id: string
  name: string
  fileName?: string
  fileSize?: number
  thumbnailUrl?: string
  drawingFileName?: string
  drawingFileSize?: number
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
