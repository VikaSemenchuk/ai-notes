import type { Note } from '@/lib/notes';
import { Summery } from '@/components/summary';
import { Translation } from './translation';

// Your AI features go here. This file runs on the server, and any part that
// needs the browser goes in a client component of its own.
export function AiTools({ note }: { note: Note }) {
  return (
    <section aria-label={`AI tools for ${note.title}`} className="mt-8 border-t border-slate-200 pt-6">
      <h2 className="text-lg font-medium">AI tools</h2>
      <Summery noteId={note.id} />
      <Translation noteId={note.id} />
    </section>
  );
}
