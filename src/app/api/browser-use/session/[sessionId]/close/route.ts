import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  context: any
) {
  try {
    const { sessionId } = context.params
    
    // Proxy request to Python backend browser-use service
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    const response = await fetch(`${backendUrl}/browser-use/session/${sessionId}/close`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error closing browser-use session:', error)
    return new NextResponse(JSON.stringify({ error: 'Failed to close browser-use session' }), { status: 500 })
  }
}