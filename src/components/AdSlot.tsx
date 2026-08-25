"use client";

import { useEffect, useState } from "react";
import { AD_CONSENT_EVENT, getStoredAdConsent } from "@/lib/adConsent";

type AdSlotProps = {
  variant?: "banner" | "box";
  className?: string;
};

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";
const SLOT_IDS: Record<"banner" | "box", string> = {
  banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER || "",
  box: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOX || "",
};

let adsenseScriptLoaded = false;

function loadAdsenseScript() {
  if (adsenseScriptLoaded || !ADSENSE_CLIENT_ID) return;
  adsenseScriptLoaded = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

// Placeholder non invasivo finché non è configurato un vero account AdSense
// (NEXT_PUBLIC_ADSENSE_CLIENT_ID + slot). Mostra l'annuncio reale solo dopo
// che l'utente ha dato consenso ai cookie pubblicitari (vedi CookieConsent.tsx).
export function AdSlot({ variant = "banner", className = "" }: AdSlotProps) {
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    setConsentAccepted(getStoredAdConsent() === "accepted");
    function handleConsentChange(event: Event) {
      setConsentAccepted((event as CustomEvent).detail === "accepted");
    }
    window.addEventListener(AD_CONSENT_EVENT, handleConsentChange);
    return () => window.removeEventListener(AD_CONSENT_EVENT, handleConsentChange);
  }, []);

  const slotId = SLOT_IDS[variant];
  const adsEnabled = consentAccepted && !!ADSENSE_CLIENT_ID && !!slotId;

  useEffect(() => {
    if (!adsEnabled) return;
    loadAdsenseScript();
    try {
      (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || [];
      (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.push({});
    } catch {
      // Ignorato: può fallire se lo script non è ancora caricato al primo render.
    }
  }, [adsEnabled]);

  const sizeClasses = variant === "banner" ? "h-16 w-full" : "h-40 w-full";

  if (adsEnabled) {
    return (
      <ins
        className={`adsbygoogle block ${sizeClasses} ${className}`}
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-400 ${sizeClasses} ${className}`}
      aria-label="Spazio pubblicitario"
    >
      Spazio pubblicitario
    </div>
  );
}
