"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Compact social auth row — Google + KingsChat side by side.
 * Icon + short label keeps the form uncluttered. Shared by login & signup.
 */
export function SocialAuthButtons({ onError }: { onError?: (message: string) => void }) {
  const [loading, setLoading] = useState<"" | "google">("");

  const handleGoogle = async () => {
    onError?.("");
    setLoading("google");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (error: any) {
      onError?.(error.message);
      setLoading("");
    }
  };

  const handleKingsChat = () => {
    // Server route starts the OAuth2 flow; it redirects back with ?kc=unavailable
    // until the KingsChat app is approved and configured.
    window.location.href = "/api/kingschat/login";
  };

  const btn =
    "flex h-11 items-center justify-center gap-2.5 rounded-lg border border-input bg-background text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60 dark:bg-input/30 dark:hover:bg-input/50";

  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={handleGoogle} disabled={loading !== ""} className={btn}>
        {loading === "google" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon className="size-5" />
        )}
        Google
      </button>
      <button type="button" onClick={handleKingsChat} className={btn}>
        <Image
          src="/kingschat-logo-transparent.png"
          alt=""
          width={20}
          height={20}
          className="size-5 shrink-0 object-contain"
        />
        KingsChat
      </button>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
