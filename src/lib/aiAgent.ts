// Lightweight AI agent wrapper that calls the serverless chat-tutor function
export type ExplainRequest = {
  topic: string
  level?: 'basic' | 'intermediate' | 'advanced'
  examples?: boolean
}

export async function explain(request: ExplainRequest): Promise<string> {
  const url = '/.netlify/functions/chat-tutor'
  // If project uses supabase edge functions, adapt the path to '/functions/chat-tutor' or full URL.
  const body = {
    prompt: `Explain the following topic: ${request.topic}`,
    level: request.level ?? 'basic',
    examples: !!request.examples,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`AI explain request failed: ${res.status} ${text}`)
  }

  const data = await res.json().catch(() => ({ result: '' }))
  // Expecting { result: '...' } from the serverless function — adjust as needed.
  return data.result ?? ''
}

export default { explain }
