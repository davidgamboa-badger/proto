
'use client'


import { useQuoteStore } from "@/lib/quote-store";
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckoutPartsReview } from '@/components/checkout/parts-review'
import { OrderSummary } from '@/components/checkout/order-summary'
import { CheckoutFormData } from '@/lib/checkout-types'

function CheckoutPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const quoteId = searchParams?.get('quoteId') || ''
  
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(true)
  const [quoteData, setQuoteData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    shippingInfo: {
      fullName: '',
      company: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
      email: ''
    },
    billingInfo: {
      sameAsShipping: true
    },
    paymentMethod: 'credit_card'
  })

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
if (!quoteId) {
setError("No quote ID provided");
setLoading(false);
return;
}


const quote = useQuoteStore.getState().getQuote(quoteId);
if (!quote) {
// optional: support deep-linking by redirecting back
setError("Quote not found in this session");
setLoading(false);
return;
}


// You can compute totals here or in OrderSummary; using subtotal from store keeps UI consistent
setQuoteData({
id: quote.id,
parts: quote.parts,
subtotal: quote.subtotal,
tax: 0, // you removed tax calc from sidebar; leave tax to final payment step
total: quote.subtotal, // display-only; show "plus shipping & taxes at checkout"
additionalRequirements: [],
notes: "",
});
setLoading(false);
}, [quoteId]);



  const handleFormUpdate = (section: keyof CheckoutFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // Validate form data
      if (!formData.shippingInfo.fullName || !formData.shippingInfo.address) {
        alert('Please fill in all required shipping information')
        setSubmitting(false)
        return
      }

      // Submit checkout (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Order placed successfully!')
      router.push('/')
    } catch (err) {
      alert('Failed to submit order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackToQuote = () => {
    router.push(quoteId ? `/?quoteId=${quoteId}` : '/')
  }

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quote...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Error Loading Quote</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Get Quote
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBackToQuote}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Quote</span>
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
                <p className="text-sm text-slate-600">Complete your order</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Quote ID</p>
              <p className="text-lg font-semibold text-slate-900">{quoteId}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Parts Review Only */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CheckoutPartsReview 
                quoteId={quoteId}
                onEditQuote={handleBackToQuote}
                parts={quoteData?.parts ?? []}
  onPartsChange={(nextParts) => {
    // keep store + local state in sync
    useQuoteStore.getState().updateQuoteParts(quoteId, nextParts);
    setQuoteData((prev: any) =>
      prev ? { ...prev, parts: nextParts, subtotal: prev.subtotal /* or recompute here if needed */ } : prev
    );
  }}
              />
            </motion.div>
          </div>

          {/* Order Summary Sidebar - With All Forms */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="sticky top-24"
            >
              <OrderSummary
                quoteData={quoteData}
                formData={formData}
                submitting={submitting}
                onSubmit={handleSubmit}
                onFormUpdate={handleFormUpdate}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  )
}
