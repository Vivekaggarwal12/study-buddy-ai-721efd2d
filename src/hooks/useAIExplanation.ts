import { useState, useCallback } from 'react'
import { explain, ExplainRequest } from '../lib/aiAgent'

export function useAIExplanation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string>('')

  const getExplanation = useCallback(async (req: ExplainRequest) => {
    setLoading(true)
    setError(null)
    setResult('')
    try {
      const res = await explain(req)
      setResult(res)
      return res
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, result, getExplanation }
}

export default useAIExplanation
