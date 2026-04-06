import { NextRequest, NextResponse } from "next/server";

const VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; // George — warm authoritative British
const MODEL_ID = "eleven_turbo_v2_5";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 503 });
  }

  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const trimmed = text.slice(0, 2000);

  // /with-timestamps returns JSON: { audio_base64, alignment: { characters[], character_start_times_seconds[], character_end_times_seconds[] } }
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        text: trimmed,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.82,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
      signal: AbortSignal.timeout(60_000),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error("[tts] ElevenLabs error:", res.status, body);
    return NextResponse.json({ error: `ElevenLabs ${res.status}` }, { status: res.status });
  }

  const data = await res.json();

  // Return audio as base64 + per-character start times
  return NextResponse.json({
    audioBase64: data.audio_base64 as string,
    // character_start_times_seconds[i] = when character i starts being spoken
    charTimes: data.alignment?.character_start_times_seconds as number[] ?? [],
  });
}
