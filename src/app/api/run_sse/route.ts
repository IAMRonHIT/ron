import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    const resp = await fetch(`${backendUrl}/api/run_sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!resp.ok || !resp.body) {
      const text = await resp.text().catch(() => '')
      return new NextResponse(text || 'Upstream error', { status: resp.status || 500 })
    }

    return new NextResponse(resp.body, {
      status: 200,
      headers: new Headers({ 'Content-Type': 'text/event-stream' }),
    })
  } catch (e: any) {
    return new NextResponse(`Error: ${e?.message || 'Internal error'}`, { status: 500 })
  }
}
