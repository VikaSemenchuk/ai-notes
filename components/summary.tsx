"use client"


import { useState, useTransition } from 'react';
import { summariseNote } from "@/app/notes/ai-actions";

export function Summery({ noteId }: { noteId: string }) { 
    const [length, setLength] = useState('bullets')
    const [result, setResult] = useState<Awaited<ReturnType<typeof summariseNote>>>();
    const [isPending, startTransition] = useTransition();
    
    return (
        <div className="mt-4 ">
            <label className="mr-2 text-sm font-medium text-slate-700">

            <select value={length} className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200" onChange={(e) => setLength(e.target.value)}>
                <option value="bullets">Three bullets</option>
                <option value="sentence">One sentence</option>
                <option value="paragraph">Short paragraph</option>
            </select>
            </label>
            <button
                className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50 mt-2"
                disabled={isPending}
                onClick={() => startTransition(async () => setResult(await summariseNote(noteId, length)))} >
            { isPending ? 'Summarising...' : 'Summarise'}
            </button>
            {result?.headline && (
                <div className="mt-3">
                    <h3 className="font-medium">{result?.headline}</h3>
                    <ul className="mt-2 list-disc pl-5 text-sm">
                        {result.keyPoints?.map((point, i) => <li key={i}>{point}</li>)}
                    </ul>
                </div>
            )}
            {result?.error && <p className="mt-3 text-sm text-red-700">{ result.error}</p>}
        </div>
    )
}