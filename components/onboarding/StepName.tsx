"use client";

import { useState, useEffect, useRef } from "react";

interface StepNameProps {
  prompt: string;
  placeholder: string;
  hint: string;
  submitLabel: string;
  onSubmit: (name: string) => void;
}

export function StepName({ prompt, placeholder, hint, submitLabel, onSubmit }: StepNameProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length > 0) onSubmit(trimmed);
  }

  const canSubmit = value.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8 w-full max-w-sm">
      <div className="text-center">
        <h2 className="font-display text-2xl text-parchment mb-2">{prompt}</h2>
        <p className="font-flavour italic text-muted-blue text-sm">{hint}</p>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={32}
        autoComplete="off"
        className={`
          w-full bg-transparent border-b-2 px-1 py-2
          font-body text-lg text-center text-parchment placeholder-slate
          outline-none transition-colors duration-200
          ${canSubmit ? "border-gold" : "border-border-subtle focus:border-muted-blue"}
        `}
        aria-label={prompt}
      />

      <button
        type="submit"
        disabled={!canSubmit}
        className="font-ui text-sm px-8 py-2.5 rounded bg-gold text-on-gold font-semibold
          hover:bg-gold-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  );
}
