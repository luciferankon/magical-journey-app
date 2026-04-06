"use client";

import { useState } from "react";

type SceneResult = {
  sceneId: string;
  success: boolean;
  skipped?: boolean;
  error?: string;
  size?: number;
};

const SCENES = [
  "aethermoor_gates",
  "entrance_courtyard",
  "grand_hall",
  "common_room",
  "casting_hall",
  "restricted_corridor",
  "library",
  "aldric_office",
  "courtyard_night",
];

export default function GenerateScenesPage() {
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [results, setResults] = useState<SceneResult[]>([]);
  const [message, setMessage] = useState("");

  async function generate() {
    setStatus("generating");
    setResults([]);
    setMessage("Generating 9 scenes — this takes about 3–5 minutes, please wait...");

    try {
      const res = await fetch("/api/generate-scenes");
      const data = await res.json();
      setResults(data.results ?? []);
      setMessage(data.message ?? "Done");
      setStatus("done");
    } catch (err) {
      setMessage(`Error: ${err}`);
      setStatus("error");
    }
  }

  return (
    <div style={{ background: "#0D0F1A", minHeight: "100vh", padding: "40px", color: "#F0EAD6", fontFamily: "Georgia, serif" }}>
      <h1 style={{ color: "#C9A84C", fontSize: "28px", marginBottom: "8px" }}>Scene Image Generator</h1>
      <p style={{ color: "#9A9EB8", marginBottom: "32px" }}>
        Generates AI painterly dark fantasy backgrounds for all 9 game locations using Pollinations.ai (free).
        Images are saved to <code style={{ color: "#C9A84C" }}>public/images/scenes/</code>.
      </p>

      {status === "idle" && (
        <button
          onClick={generate}
          style={{
            background: "#C9A84C", color: "#0D0F1A", border: "none",
            padding: "14px 32px", fontSize: "16px", cursor: "pointer",
            fontFamily: "Georgia, serif", fontWeight: "bold",
          }}
        >
          Generate All 9 Scenes
        </button>
      )}

      {status === "generating" && (
        <div>
          <div style={{ color: "#C9A84C", fontSize: "18px", marginBottom: "16px" }}>⏳ {message}</div>
          <div style={{ color: "#5C607A" }}>Generating scenes sequentially...</div>
          {SCENES.map((id) => (
            <div key={id} style={{ color: "#5C607A", padding: "4px 0" }}>◌ {id}</div>
          ))}
        </div>
      )}

      {(status === "done" || status === "error") && (
        <div>
          <div style={{ color: status === "done" ? "#4CAF7A" : "#C94C4C", fontSize: "20px", marginBottom: "24px" }}>
            {status === "done" ? "✓" : "✗"} {message}
          </div>
          {results.map((r) => (
            <div key={r.sceneId} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "8px 0", borderBottom: "1px solid #1C1F33" }}>
              <span style={{ color: r.success ? "#4CAF7A" : "#C94C4C", fontSize: "18px" }}>
                {r.success ? "✓" : "✗"}
              </span>
              <span style={{ minWidth: "200px", color: "#F0EAD6" }}>{r.sceneId}</span>
              {r.success ? (
                <>
                  <span style={{ color: r.skipped ? "#5C607A" : "#9A9EB8" }}>
                    {r.skipped ? "already done · " : ""}{(r.size! / 1024).toFixed(0)} KB
                  </span>
                  <img
                    src={`/images/scenes/${r.sceneId}.jpg`}
                    alt={r.sceneId}
                    style={{ height: "80px", width: "142px", objectFit: "cover", border: "1px solid #2E3150" }}
                  />
                </>
              ) : (
                <span style={{ color: "#C94C4C", fontSize: "13px" }}>{r.error}</span>
              )}
            </div>
          ))}

          {status === "done" && results.some(r => !r.success) && (
            <button
              onClick={generate}
              style={{
                marginTop: "24px",
                background: "#2E3150", color: "#C9A84C", border: "1px solid #C9A84C",
                padding: "10px 24px", fontSize: "14px", cursor: "pointer",
              }}
            >
              Retry Failed Scenes
            </button>
          )}

          {status === "done" && results.every(r => r.success) && (
            <div style={{ marginTop: "32px", padding: "16px", background: "#141624", border: "1px solid #4CAF7A" }}>
              <div style={{ color: "#4CAF7A", marginBottom: "8px" }}>All scenes generated successfully!</div>
              <a href="/" style={{ color: "#C9A84C" }}>→ Go play the game</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
