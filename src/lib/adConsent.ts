export const AD_CONSENT_STORAGE_KEY = "slabok-ad-consent";
export const AD_CONSENT_EVENT = "slabok-ad-consent-changed";

export type AdConsentValue = "accepted" | "rejected";

export function getStoredAdConsent(): AdConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(AD_CONSENT_STORAGE_KEY);
  return value === "accepted" || value === "rejected" ? value : null;
}

export function setStoredAdConsent(value: AdConsentValue) {
  window.localStorage.setItem(AD_CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent(AD_CONSENT_EVENT, { detail: value }));
}
