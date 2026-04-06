"use client";

import uiCopy from "@/content/ui-copy.json";

const LOADING_LINES: string[] = uiCopy.loading.flavourLines;

interface LoadingScreenProps {
  line?: string;
}

export function LoadingScreen({ line }: LoadingScreenProps) {
  const text = line ?? LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)];

  return (
    <div className="fixed inset-0 bg-deep flex flex-col items-center justify-center z-50">
      {/* Crest placeholder — replace with animated SVG asset when available */}
      <div className="w-24 h-24 rounded-full border-2 border-gold mb-8 flex items-center justify-center relative">
        <div className="absolute inset-0 rounded-full border border-gold opacity-30 scale-125 animate-ping" />
        <svg
          className="w-12 h-12 text-gold opacity-80"
          fill="none"
          viewBox="0 0 48 48"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          {/* Stylised "A" for Aethermoor */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M24 8 L8 40 M24 8 L40 40 M13 28 h22"
          />
        </svg>
      </div>

      {/* Progress sweep */}
      <div className="w-48 h-px bg-border-subtle overflow-hidden mb-6">
        <div className="h-full bg-gold animate-[progress-sweep_2s_ease-in-out_infinite]" />
      </div>

      {/* Flavour text */}
      <p className="font-flavour italic text-muted-blue text-sm">{text}</p>
    </div>
  );
}
