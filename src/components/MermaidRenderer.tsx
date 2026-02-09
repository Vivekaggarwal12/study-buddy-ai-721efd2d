import { useEffect, useRef } from 'react'

interface Props { code: string }

export default function MermaidRenderer({ code }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    let mounted = true
    // Dynamically load mermaid from CDN if not present
    const load = async () => {
      const win = window as any
      if (!win.mermaid) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/mermaid@10/dist/mermaid.min.js'
        script.async = true
        document.head.appendChild(script)
        await new Promise((res) => (script.onload = res))
      }
      if (!mounted) return
      try {
        win.mermaid.initialize({ startOnLoad: false })
        const id = 'mermaid-' + Math.random().toString(36).slice(2, 9)
        const svg = win.mermaid.render(id, code)
        if (containerRef.current) containerRef.current.innerHTML = svg
      } catch (e) {
        if (containerRef.current) containerRef.current.textContent = 'Failed to render diagram.'
      }
    }
    load()
    return () => { mounted = false }
  }, [code])

  return <div ref={containerRef} className="my-2 overflow-auto" />
}
