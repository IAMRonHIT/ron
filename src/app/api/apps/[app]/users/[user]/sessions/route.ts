import { NextResponse } from 'next/server'

export async function POST(request: Request, context: any) {
  try {
    const { app, user } = context.params || {}
    if (!app || !user) {
      return NextResponse.json({ error: 'Missing app or user in path' }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    const resp = await fetch(`${backendUrl}/api/apps/${app}/users/${user}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      return NextResponse.json({ error: text || `Backend ${resp.status}` }, { status: resp.status })
    }

    const data = await resp.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
