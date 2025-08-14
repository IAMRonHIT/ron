'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestComputerUsePage() {
  const [testStatus, setTestStatus] = useState<string>('Ready to test')
  const [liveUrl, setLiveUrl] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const runComputerUseTest = async () => {
    setIsLoading(true)
    setTestStatus('Starting computer use test...')
    setMessages([])
    
    try {
      // Test computer use through the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Open a web browser and navigate to google.com, then take a screenshot'
            }
          ],
          model: 'claude-3-5-sonnet-20241022',
          enableComputerUse: true
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              // Check for browser live URL
              if (data.type === 'browser_live_url') {
                setLiveUrl(data.live_url)
                setSessionId(data.session_id)
                setTestStatus('Computer use session created!')
              }
              
              // Collect messages
              if (data.type === 'content' || data.type === 'tool_use') {
                setMessages(prev => [...prev, data])
              }
              
              // Update status based on content
              if (data.type === 'content' && data.text) {
                setTestStatus(`Claude: ${data.text.substring(0, 100)}...`)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }

      setTestStatus('Computer use test completed!')
    } catch (error) {
      console.error('Test failed:', error)
      setTestStatus(`Test failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Computer Use Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={runComputerUseTest} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Testing...' : 'Run Computer Use Test'}
            </Button>
            <span className="text-sm text-gray-600">{testStatus}</span>
          </div>

          {liveUrl && (
            <div className="space-y-2">
              <h3 className="font-semibold">Live Session</h3>
              <div className="text-sm">
                <p>Session ID: {sessionId}</p>
                <p>Live URL: <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{liveUrl}</a></p>
              </div>
              
              {/* Embed the live view */}
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={liveUrl}
                  className="w-full h-[600px]"
                  title="Computer Use Display"
                />
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Messages</h3>
              <div className="max-h-96 overflow-y-auto border rounded p-4 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div key={idx} className="mb-2 text-sm">
                    {msg.type === 'tool_use' ? (
                      <div className="bg-blue-100 p-2 rounded">
                        Tool: {msg.name} - {JSON.stringify(msg.input).substring(0, 100)}...
                      </div>
                    ) : (
                      <div className="bg-white p-2 rounded border">
                        {msg.text || JSON.stringify(msg).substring(0, 100)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}