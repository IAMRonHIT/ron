import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  context: any
) {
  try {
    const body = await request.json()
    const { sessionId } = context.params
    
    // Proxy request to Python backend browser-use service
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    const response = await fetch(`${backendUrl}/browser-use/session/${sessionId}/navigate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error navigating browser-use session:', error)
    return new NextResponse(JSON.stringify({ error: 'Failed to navigate browser-use session' }), { status: 500 })
  }
}