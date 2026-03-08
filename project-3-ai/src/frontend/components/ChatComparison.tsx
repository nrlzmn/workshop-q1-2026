import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Send } from 'lucide-react'

interface AIResponse {
  response?: string
  result?: {
    response?: string
  }
  choices?: Array<{
    message?: {
      content?: string
      refusal?: string | null
    }
    logprobs?: any
    finish_reason?: string
  }>
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
  headers?: {
    'cf-ai-req-id'?: string
    'cf-aig-cache-status'?: string
    'cf-aig-event-id'?: string
    'cf-aig-log-id'?: string
    'cf-aig-step'?: string
  }
  success?: boolean
  error?: string | Array<{
    code?: number
    message?: string
  }>
  messages?: any[]
}

export default function ChatComparison() {
  const [prompt, setPrompt] = useState('')
  const [workersAIResponse, setWorkersAIResponse] = useState('')
  const [aiGatewayResponse, setAIGatewayResponse] = useState('')
  const [aiGatewayMetadata, setAIGatewayMetadata] = useState<AIResponse | null>(null)

  const workersAIMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch('/api/workers-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      return response.json() as Promise<AIResponse>
    },
    onSuccess: (data) => {
      setWorkersAIResponse(data.response || data.result?.response || 'No response')
    },
    onError: (error) => {
      setWorkersAIResponse(`Error: ${error.message}`)
    },
  })

  const aiGatewayMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch('/api/ai-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      return response.json() as Promise<AIResponse>
    },
    onSuccess: (data) => {
      // Check for DLP policy violations or other errors
      if (data.success === false && Array.isArray(data.error) && data.error.length > 0) {
        const errorMsg = data.error.map(e => `[${e.code}] ${e.message}`).join(', ')
        setAIGatewayResponse(`⚠️ ${errorMsg}`)
        setAIGatewayMetadata(data)
        return
      }
      
      // Check for string error
      if (typeof data.error === 'string') {
        setAIGatewayResponse(`Error: ${data.error}`)
        setAIGatewayMetadata(data)
        return
      }

      // Normal response
      const content = data.choices?.[0]?.message?.content || data.response || data.result?.response || 'No response'
      setAIGatewayResponse(content)
      setAIGatewayMetadata(data)
    },
    onError: (error) => {
      setAIGatewayResponse(`Error: ${error.message}`)
      setAIGatewayMetadata(null)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      workersAIMutation.mutate(prompt)
      aiGatewayMutation.mutate(prompt)
    }
  }

  const isLoading = workersAIMutation.isPending || aiGatewayMutation.isPending

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-black">
          Content Moderation Demo
        </h1>

        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Begin chatting..."
                rows={5}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6821f] focus:border-transparent text-base resize-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 bottom-2 bg-[#f6821f] text-white p-2 rounded-md hover:bg-[#e57510] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8">
            <h2 className="text-3xl font-semibold text-[#f6821f] mb-6">
              Workers AI
            </h2>

            {(workersAIResponse || workersAIMutation.isPending) && (
              <div className="bg-[#fff4e6] border border-[#f6821f] rounded-lg p-4">
                <p className="text-[#f6821f] text-sm leading-relaxed">
                  {workersAIMutation.isPending ? 'Loading...' : workersAIResponse}
                </p>
              </div>
            )}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8">
            <h2 className="text-3xl font-semibold text-[#f6821f] mb-6">
              AI Gateway
            </h2>

            {(aiGatewayResponse || aiGatewayMutation.isPending) && (
              <div className="bg-[#fff4e6] border border-[#f6821f] rounded-lg p-4 mb-6">
                <p className="text-[#f6821f] text-sm leading-relaxed">
                  {aiGatewayMutation.isPending ? 'Loading...' : aiGatewayResponse}
                </p>
              </div>
            )}

            {aiGatewayMetadata && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Observability</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  {aiGatewayMetadata.success === false && Array.isArray(aiGatewayMetadata.error) && (
                    <>
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                        <p className="text-sm font-semibold text-red-800 mb-2">DLP Policy Violation</p>
                        {aiGatewayMetadata.error.map((err, idx) => (
                          <div key={idx} className="text-sm text-red-700">
                            <span className="font-mono">Code {err.code}:</span> {err.message}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Success:</span>
                        <span className="font-mono text-red-600">false</span>
                      </div>
                    </>
                  )}
                  
                  {aiGatewayMetadata.choices?.[0] && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Finish Reason:</span>
                        <span className="font-mono text-gray-800">{aiGatewayMetadata.choices[0].finish_reason || 'N/A'}</span>
                      </div>
                      {aiGatewayMetadata.choices[0].message?.refusal && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Refusal:</span>
                          <span className="font-mono text-gray-800">{aiGatewayMetadata.choices[0].message.refusal}</span>
                        </div>
                      )}
                      {aiGatewayMetadata.choices[0].logprobs && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Log Probs:</span>
                          <span className="font-mono text-gray-800">Available</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {aiGatewayMetadata.usage && (
                    <>
                      <div className="border-t border-gray-300 pt-2 mt-2"></div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Prompt Tokens:</span>
                        <span className="font-mono text-gray-800">{aiGatewayMetadata.usage.prompt_tokens || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completion Tokens:</span>
                        <span className="font-mono text-gray-800">{aiGatewayMetadata.usage.completion_tokens || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Tokens:</span>
                        <span className="font-mono text-gray-800">{aiGatewayMetadata.usage.total_tokens || 0}</span>
                      </div>
                    </>
                  )}

                  {aiGatewayMetadata.headers && (
                    <>
                      <div className="border-t border-gray-300 pt-2 mt-2"></div>
                      {aiGatewayMetadata.headers['cf-ai-req-id'] && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Request ID:</span>
                          <span className="font-mono text-gray-800 text-xs">{aiGatewayMetadata.headers['cf-ai-req-id']}</span>
                        </div>
                      )}
                      {aiGatewayMetadata.headers['cf-aig-cache-status'] && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Cache Status:</span>
                          <span className="font-mono text-gray-800">{aiGatewayMetadata.headers['cf-aig-cache-status']}</span>
                        </div>
                      )}
                      {aiGatewayMetadata.headers['cf-aig-event-id'] && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Event ID:</span>
                          <span className="font-mono text-gray-800 text-xs">{aiGatewayMetadata.headers['cf-aig-event-id']}</span>
                        </div>
                      )}
                      {aiGatewayMetadata.headers['cf-aig-log-id'] && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Log ID:</span>
                          <span className="font-mono text-gray-800 text-xs">{aiGatewayMetadata.headers['cf-aig-log-id']}</span>
                        </div>
                      )}
                      {aiGatewayMetadata.headers['cf-aig-step'] && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Step:</span>
                          <span className="font-mono text-gray-800">{aiGatewayMetadata.headers['cf-aig-step']}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <a 
                      href="https://developers.cloudflare.com/ai-gateway/glossary/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-[#f6821f] hover:underline"
                    >
                      Learn more about AI Gateway headers →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-auto bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100">
        <div className="py-4 px-8">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-medium text-gray-700">Powered by</span>
            <span className="text-lg font-bold text-[#f6821f] drop-shadow-[0_0_8px_rgba(246,130,31,0.6)]">
              Cloudflare
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
