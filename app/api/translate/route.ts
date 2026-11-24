import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { claude, model } from "@/lib/claude";
import { getNote } from "@/lib/notes";

const Body = z.object({
  noteId: z.string(),
  language: z.enum(["German", "Spanish", "French"]),
});

export async function POST(request: Request) { 
    const parsed = Body.safeParse(await request.json().catch(() => null))
    if (!parsed.success) { 
        return Response.json({
          error: "Choose a note and a supported language.",
        }, {status: 400});
    }

    const note = getNote(parsed.data.noteId);
    if (!note)
        return Response.json({ error: "Note not found." }, { status: 404 });

    const SYSTEM_PROMT = [
      `Translate the note into ${parsed.data.language}.`,
      "Reply with the translation only.",
    ].join(" ");

    const stream = claude.messages.stream({
      model,
      max_tokens: 16384,
      system: SYSTEM_PROMT,
      messages: [{ role: "user", content: `<note>${note.body}</note>` }],
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream({
        async start(controller) { 
            stream.on("text", (text) => controller.enqueue(encoder.encode(text)));

            try {
                const message = await stream.finalMessage()
                if (message.stop_reason !== 'end_turn') throw new Error(`Stopped early: ${message.stop_reason}`);
                controller.close()
                console.log(
                  "translation -> ",
                  "input: ",
                  message.usage.input_tokens,
                  "output: ",
                  message.usage.output_tokens,
                );
            } catch (err) {
                if (err instanceof Anthropic.APIUserAbortError) { 
                    console.log(
                      "Translation cancelled: the client left, generation stopped.",
                    );
                    return;
                }
                console.error(err)
                controller.error(err)
            }
        },
        cancel() { 
            stream.abort()
        }
    })
    

    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}




