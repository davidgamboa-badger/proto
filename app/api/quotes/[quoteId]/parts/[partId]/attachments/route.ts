
import { NextRequest, NextResponse } from 'next/server'

// POST /api/quotes/[quoteId]/parts/[partId]/attachments - Upload 2D file attachment
export async function POST(
  request: NextRequest,
  { params }: { params: { quoteId: string; partId: string } }
) {
  try {
    const { quoteId, partId } = params
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'image/svg+xml', 'application/dxf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PNG, JPG, PDF, SVG, DXF' },
        { status: 400 }
      )
    }

    // Validate file size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10 MB limit' },
        { status: 400 }
      )
    }

    // Mock file upload - In production, upload to S3 or cloud storage
    // const buffer = Buffer.from(await file.arrayBuffer())
    // const cloud_storage_path = await uploadToS3(buffer, file.name)

    const mockAttachment = {
      id: `${Date.now()}`,
      partId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      url: `/uploads/${file.name}` // Mock URL
    }

    return NextResponse.json(mockAttachment)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// GET /api/quotes/[quoteId]/parts/[partId]/attachments - Get all attachments for a part
export async function GET(
  request: NextRequest,
  { params }: { params: { quoteId: string; partId: string } }
) {
  try {
    const { quoteId, partId } = params

    // Mock data - replace with actual database query
    const mockAttachments: any[] = []

    return NextResponse.json(mockAttachments)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    )
  }
}
