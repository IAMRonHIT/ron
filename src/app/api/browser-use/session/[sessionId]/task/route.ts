import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  context: any
) {
  try {
    const { task } = await request.json()
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task is required' },
        { status: 400 }
      )
    }

    // Forward the request to the backend FastAPI server
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    const response = await fetch(`${backendUrl}/browser-use/session/${context.params.sessionId}/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.detail || `Backend request failed with status ${response.status}` 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error executing browser task:', error)
    return new NextResponse(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Internal server error' }), { status: 500 })
  }
}