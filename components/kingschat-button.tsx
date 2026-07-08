"use client";

import Image from "next/image";

/**
 * Placeholder "Continue with KingsChat" button.
 * Visually distinct + disabled until the OAuth backend is wired.
 */
export function KingsChatButton({ label = "Continue with KingsChat" }: { label?: string }) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      title="KingsChat sign-in is coming soon"
      className="group relative flex h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-gradient-to-r from-[#0b57d0] to-[#3b82f6] px-4 text-sm font-medium text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Image
        src="/kingschat-logo-transparent.png"
        alt="KingsChat Logo"
        width={20}
        height={20}
        className="shrink-0 object-contain"
      />
      {label}
      <span className="absolute right-3 rounded-full bg-white/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide">
        Soon
      </span>
    </button>
  );
}
