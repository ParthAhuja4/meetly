import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { StreamTranscriptItem } from "@/modules/meetings/types";
import { eq, inArray } from "drizzle-orm";
import JSONL from "jsonl-parse-stringify";
import { gemini, createAgent, TextMessage } from "@inngest/agent-kit";

const summarizer = createAgent({
  name: "summarizer",
  system:
    `You are an expert summarizer. Write readable, concise meeting summaries.Use this structure:
    ### Overview
    Provide a clear narrative summary of the meeting.
    ### Notes
    Break down key points by topics with bullet points.
    Example:
    #### Topic Name
    - Important discussion
    - Key feature or point
    - Follow-up item`.trim(),
  model: gemini({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY!,
  }),
});

export const meetingsProcessing = inngest.createFunction(
  { id: "meetings/processing" },
  { event: "meetings/processing" },
  async ({ event, step }) => {
    const rawTranscript = await step.run("fetch-transcript", async () => {
      const res = await fetch(event.data.transcriptUrl);

      if (!res.ok) {
        throw new Error("Failed to fetch transcript");
      }

      return res.text();
    });

    const transcript = await step.run("parse-transcript", async () => {
      const parsed = JSONL.parse<StreamTranscriptItem>(rawTranscript);

      return parsed.filter(
        (item) => item.type === "speech" && item.text && item.speaker_id,
      );
    });

    if (!transcript.length) {
      await db
        .update(meetings)
        .set({
          summary: "No speech detected in this meeting.",
          status: "completed",
        })
        .where(eq(meetings.id, event.data.meetingId));

      return;
    }

    const transcriptWithSpeakers = await step.run("add-speakers", async () => {
      const speakerIds = [...new Set(transcript.map((t) => t.speaker_id))];

      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds));

      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds));

      const speakers = [...userSpeakers, ...agentSpeakers];

      return transcript.map((item) => {
        const speaker = speakers.find((s) => s.id === item.speaker_id);

        return {
          ...item,
          name: speaker?.name ?? "Unknown",
        };
      });
    });

    const conversation = await step.run("build-conversation", async () => {
      const merged = transcriptWithSpeakers.reduce(
        (acc: { name: string; text: string }[], item) => {
          const last = acc[acc.length - 1];

          if (last && last.name === item.name) {
            last.text += " " + item.text;
          } else {
            acc.push({
              name: item.name,
              text: item.text,
            });
          }

          return acc;
        },
        [],
      );

      return merged.map((m) => `${m.name}: ${m.text}`).join("\n");
    });

    const { output } = await summarizer.run(
      `Summarize the following meeting transcript:\n\n${conversation}`,
    );

    const summary = (output[0] as TextMessage).content as string;

    await step.run("save-summary", async () => {
      await db
        .update(meetings)
        .set({
          summary,
          status: "completed",
        })
        .where(eq(meetings.id, event.data.meetingId));
    });
  },
);
