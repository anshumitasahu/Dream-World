import { useEffect, useRef, useState } from "react";
import { useGoogleAuth } from "../../hooks/useAuth";

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

export default function GoogleSignInButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { mutate: googleAuthMutate } = useGoogleAuth();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    const buttonElement = buttonRef.current;
    if (!clientId || !buttonElement) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;
        window.google!.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              googleAuthMutate(response.credential);
            }
          },
        });
        window.google!.accounts.id.renderButton(buttonRef.current, {
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 320,
        });
      })
      .catch(() => setLoadError("Could not load Google sign-in"));

    return () => {
      cancelled = true;
    };
  }, [clientId, googleAuthMutate]);

  if (!clientId) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={buttonRef} />
      {loadError && <p className="text-sm text-red-400">{loadError}</p>}
    </div>
  );
}