import { NextResponse } from "next/server";
import { writeFile, mkdir, access } from "fs/promises";
import path from "path";

const STYLE =
  "dark fantasy illustrated concept art, painterly oil painting style, " +
  "moody atmospheric lighting, visible brushstrokes, muted earth tones with deep shadows, " +
  "Disco Elysium aesthetic, painterly impressionist RPG background, " +
  "no characters, no people, wide cinematic landscape, high detail, masterpiece";

const SCENES: Record<string, string> = {
  aethermoor_gates:
    "massive gothic iron gates of a dark magic academy towering into storm clouds, " +
    "worn stone pillars carved with arcane runes glowing faintly amber, " +
    "fog rolling across cobblestone road at dusk, ravens perched on gate spires, " +
    "distant academy towers visible through the mist, overgrown vines on ancient stone walls, " +
    "a lone lantern swaying in the wind casting orange light on wet cobblestones",

  entrance_courtyard:
    "wide stone courtyard of an ancient magic academy at twilight, " +
    "gothic architecture with gargoyles and arched windows, " +
    "a central fountain with arcane water glowing faint blue, " +
    "grand stone staircase leading to imposing wooden doors, " +
    "ivy-covered walls, torches flickering in iron brackets",

  grand_hall:
    "vast grand ceremonial hall of a dark magic academy, " +
    "impossibly high vaulted stone ceiling with floating magical candles, " +
    "four long banquet tables draped in coloured house banners, " +
    "moonlight streaming through tall stained glass windows casting coloured light, " +
    "a raised stone dais at the far end with ornate podium, " +
    "golden dust motes drifting in shafts of light",

  common_room:
    "cozy but ominous student common room of a dark magic academy at midnight, " +
    "low stone ceiling, deep leather chairs around a large fireplace with blue-green flames, " +
    "bookshelves crammed with spell tomes, potions on windowsills, " +
    "cold moonlight through arched stone windows, warm firelight casting long shadows, " +
    "scattered parchment and quills on a heavy oak table",

  casting_hall:
    "dark magic training hall with high stone arches, " +
    "practice dummies scorched and blasted at the far end, " +
    "arcane sigils carved into the floor glowing electric blue, " +
    "dust and magical energy particles floating in shafts of light from narrow windows, " +
    "old wooden desks with spell books, burn marks and frost scorch patterns on the stone walls, " +
    "a large blackboard covered in magical diagrams",

  restricted_corridor:
    "long forbidden corridor deep in a gothic magic academy, " +
    "crumbling stone walls lined with locked heavy iron doors, " +
    "a single flickering torch far ahead casting harsh shadows, " +
    "broken ceiling letting in shafts of cold moonlight, " +
    "arcane warning symbols painted in fading red on the walls, " +
    "cobwebs dust long-forgotten rooms, dark doorway at the end framing absolute blackness",

  library:
    "ancient magical library with cathedral-high shelves of leather-bound tomes, " +
    "a spiraling iron staircase reaching up into shadows, " +
    "warm amber candlelight illuminating dust motes and floating books, " +
    "stained glass windows depicting mythological scenes in deep jewel tones, " +
    "heavy wooden reading desks with open tomes and brass magnifying glasses, " +
    "forbidden section sealed behind ornate iron bars at the far end",

  aldric_office:
    "dark imposing headmaster office filled with ancient magical artefacts, " +
    "a massive mahogany desk covered in parchment scrolls, " +
    "bookshelves floor to ceiling with forbidden tomes behind glass cases, " +
    "a large fireplace with green flames, taxidermied magical creatures on the walls, " +
    "a window overlooking stormy academy grounds far below, " +
    "oil paintings of stern former headmasters in ornate frames, deep dramatic shadows",

  courtyard_night:
    "dramatic night scene in the outer courtyard of a dark magic academy, " +
    "storm clouds roiling overhead lit from within by lightning, " +
    "cobblestones slick with rain reflecting torchlight and magical flares, " +
    "gothic academy towers looming against a violet storm sky, " +
    "a forbidden ritual circle scorched black into the stone ground, " +
    "one lone tower window glowing an eerie sickly purple",
};

async function downloadImage(sceneId: string, prompt: string, outputDir: string, force = false): Promise<{ sceneId: string; success: boolean; skipped?: boolean; error?: string; size?: number }> {
  const outPath = path.join(outputDir, `${sceneId}.jpg`);

  // Skip if already generated (unless force=true)
  if (!force) {
    try {
      await access(outPath);
      const { statSync } = await import("fs");
      const size = statSync(outPath).size;
      if (size > 10_000) {
        console.log(`[generate-scenes] ${sceneId}: already exists (${size} bytes), skipping`);
        return { sceneId, success: true, skipped: true, size };
      }
    } catch {
      // file doesn't exist, continue
    }
  }

  const fullPrompt = `${prompt}, ${STYLE}`;
  const encoded = encodeURIComponent(fullPrompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=1920&height=1080&model=flux&seed=42&nologo=true&enhance=true`;

  let lastError = "unknown error";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });

      if (res.status === 429) {
        const wait = attempt * 15_000; // 15s, 30s, 45s back-off
        console.log(`[generate-scenes] ${sceneId}: 429 rate-limited, waiting ${wait / 1000}s (attempt ${attempt}/3)`);
        await new Promise((r) => setTimeout(r, wait));
        lastError = "HTTP 429 (rate limited)";
        continue;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const buffer = Buffer.from(await res.arrayBuffer());
      await writeFile(outPath, buffer);
      return { sceneId, success: true, size: buffer.length };
    } catch (err) {
      lastError = String(err);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 10_000));
      }
    }
  }
  return { sceneId, success: false, error: lastError };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET() {
  const outputDir = path.join(process.cwd(), "public", "images", "scenes");
  await mkdir(outputDir, { recursive: true });

  const results = [];

  for (const [sceneId, prompt] of Object.entries(SCENES)) {
    console.log(`[generate-scenes] Generating ${sceneId}...`);
    const result = await downloadImage(sceneId, prompt, outputDir);
    results.push(result);
    console.log(`[generate-scenes] ${sceneId}: ${result.success ? (result.skipped ? `↩ skipped (${result.size} bytes)` : `✓ ${result.size} bytes`) : `✗ ${result.error}`}`);

    // Only delay between actual generation calls (not skips)
    if (!result.skipped && result.success) {
      await sleep(8000); // 8s gap — keeps us well under free-tier rate limits
    }
  }

  const successful = results.filter((r) => r.success).length;

  return NextResponse.json({
    message: `Generated ${successful}/${results.length} scenes`,
    results,
  });
}
