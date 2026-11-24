'use client'

import { useRef, useState } from 'react'

export function Translation({ noteId }: { noteId: string }) { 
    const [language, setLanguage] = useState('German')
    const [text, setText] = useState('');
    const [error, setError] = useState('')
    const [isStreaming, setIsStreaming] = useState(false);
    const controllerRef = useRef<AbortController | null>(null)

    async function translate() { 
        setText('')
        setError('')
        setIsStreaming(true)

        const controller = new AbortController()
        controllerRef.current = controller;

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noteId, language }),
                signal: controller.signal
            })

            if (!response.ok) {
                const data = await response.json().catch(() => null)
                setError(data?.error ?? 'The translation failed. Please try again.')
                return
            }

            const reader = response.body!.getReader();
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break;
                setText((current) => current + decoder.decode(value, { stream: true }));
            }

        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return
            setError('The translation was interrupted. Please try again.')
        } finally { 
            setIsStreaming(false)
        }
    }

    function stop() { 
        controllerRef.current?.abort()
    }

    return (
        <div className="mt-6 border-t border-slate-200 pt-6">
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        Translate into
        <select
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isStreaming}
        >
          <option value="German">German</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
        </select>
      </label>

      <button
        className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isStreaming}
        onClick={translate}
      >
        {isStreaming ? 'Translating...' : 'Translate'}
      </button>

      {isStreaming && (
        <button
          className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
          onClick={stop}
        >
          Stop
        </button>
      )}
    </div>

    {text && (
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="whitespace-pre-wrap text-sm leading-6">{text}</p>
        <p className="mt-3 text-xs text-slate-500">Machine translation. It may contain mistakes.</p>
      </div>
    )}
    {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  </div>
    )
}