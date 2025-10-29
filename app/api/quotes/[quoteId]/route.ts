
import { NextRequest, NextResponse } from 'next/server'

// GET /api/quotes/[quoteId] - Fetch quote data
export async function GET(
  request: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  try {
    const { quoteId } = params

    // Mock data - replace with actual database query
    const mockQuote = {
      id: quoteId,
      parts: [
        {
          id: '1',
          name: 'Metal_Fuel_Fill_Fix',
          fileName: 'Metal_Fuel_Fill_Fix.step',
          fileSize: 27460,
          attachments: [],
          selections: {
            process: 'CNC Machining',
            material: 'Aluminum 6061',
            surfaceFinish: 'Bead Blasted',
            coating: 'Clear Anodize',
            quantity: 1,
            leadTime: '7'
          },
          estimatedPrice: 86.74,
          estimatedShipDate: 'September 18'
        }
      ],
      additionalRequirements: [],
      notes: '',
      subtotal: 86.74,
      tax: 7.59,
      total: 94.33,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(mockQuote)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    )
  }
}
