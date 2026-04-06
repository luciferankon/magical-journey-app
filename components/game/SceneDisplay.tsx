"use client";

import { useEffect, useState } from "react";

interface SceneDisplayProps {
  sceneId: string;
  /** Children are layered on top of the background (dialogue box, choices, etc.) */
  children: React.ReactNode;
}

// Background image path convention: /assets/bg_{sceneId}.webp
// Falls back to a deep-space gradient when the asset is not yet available.
function bgPath(sceneId: string) {
  // Normalise scene ID to lowercase for filename matching
  const slug = sceneId.toLowerCase().replace(/_/g, "-");
  return `/assets/bg-${slug}.webp`;
}

// Scene-to-fallback gradient mapping (art direction: cinematic dark atmospheres)
const SCENE_GRADIENT: Record<string, string> = {
  default:            "from-deep via-[#0F1220] to-panel",
  S01_ARRIVAL:        "from-[#0A0C18] via-[#141830] to-[#0D0F1A]",
  S02_FIRST_MEETING:  "from-[#0C1010] via-[#121C1C] to-panel",
  S03_SORTING_CEREMONY: "from-[#0A0A14] via-[#14142A] to-[#0D0F1A]",
  S08_CHAPTER_CRISIS: "from-fracture-void via-[#12041A] to-deep",
};

export function SceneDisplay({ sceneId, children }: SceneDisplayProps) {
  const [imgError, setImgError] = useState(false);
  const [fadedIn, setFadedIn]   = useState(false);

  // Reset fade on scene change — matches 400ms scene transition spec
  useEffect(() => {
    setFadedIn(false);
    setImgError(false);
    const t = setTimeout(() => setFadedIn(true), 50);
    return () => clearTimeout(t);
  }, [sceneId]);

  const gradient = SCENE_GRADIENT[sceneId] ?? SCENE_GRADIENT.default;

  return (
    <div className="relative w-full h-full min-h-svh flex flex-col overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 -z-10">
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={sceneId}
            src={bgPath(sceneId)}
            alt=""
            aria-hidden="true"
            onError={() => setImgError(true)}
            className={`
              w-full h-full object-cover object-center
              transition-opacity duration-500
              ${fadedIn ? "opacity-100" : "opacity-0"}
            `}
          />
        ) : (
          /* Gradient fallback when asset not yet delivered */
          <div
            className={`w-full h-full bg-gradient-to-b ${gradient} transition-opacity duration-500 ${fadedIn ? "opacity-100" : "opacity-0"}`}
          />
        )}
        {/* Persistent vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-deep/10 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative flex flex-col flex-1">{children}</div>
    </div>
  );
}
