import { useEffect, useRef, useState } from "react";
import { useGoogleAuth } from "../../../hooks/useAuth";

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google script")));
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
}

function GoogleGLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export default function GoogleSignInButton({ label = "Continue with Google" }: { label?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { mutate: googleAuthMutate, isPending } = useGoogleAuth();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId || !buttonRef.current || !wrapperRef.current) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !wrapperRef.current) return;
        window.google!.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              googleAuthMutate(response.credential);
            }
          },
        });
        const width = Math.min(Math.max(wrapperRef.current.clientWidth, 200), 400);
        window.google!.accounts.id.renderButton(buttonRef.current, {
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width,
        });
      })
      .catch(() => setLoadError("Could not load Google sign-in"));

    return () => {
      cancelled = true;
    };
  }, [clientId, googleAuthMutate]);

  if (!clientId) return null;

  return (
    <div ref={wrapperRef} className="flex w-full flex-col gap-2">
      <div className="relative w-full">
        <div className="pointer-events-none flex w-full items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10">
          <GoogleGLogo />
          {isPending ? "Connecting…" : label}
        </div>
        <div
          ref={buttonRef}
          title="Continue with Google"
          className="absolute inset-0 cursor-pointer overflow-hidden opacity-0 [&_div]:w-full! [&_iframe]:h-full! [&_iframe]:w-full!"
        />
      </div>
      {loadError && <p className="text-center text-xs text-red-400">{loadError}</p>}
    </div>
  );
}
