"use client";

// 497 – Google Analytics 4 (GA4) + Search Console Setup
// Add this component to the root layout <head>

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // e.g. G-XXXXXXXXXX

export function GoogleAnalytics() {
  if (!GA_ID || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      {/* GA4 initialization */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
            cookie_flags: 'SameSite=Strict;Secure',
          });
        `}
      </Script>
    </>
  );
}

// ── Analytics event helpers ──────────────────────────────────────────────
declare global {
  interface Window { gtag?: (...args: any[]) => void; dataLayer?: any[]; }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// Predefined Yumna events
export const Analytics = {
  // Finance
  transactionCreated: (type: string, category: string) =>
    trackEvent("transaction_created", { type, category }),
  walletCreated: (walletType: string) =>
    trackEvent("wallet_created", { wallet_type: walletType }),
  reportExported: (format: string) =>
    trackEvent("report_exported", { format }),

  // AI
  aiChatSent: () => trackEvent("ai_chat_sent"),
  aiTransactionConfirmed: () => trackEvent("ai_transaction_confirmed"),

  // Islamic tools
  zakatCalculated: (liable: boolean) =>
    trackEvent("zakat_calculated", { liable: String(liable) }),
  faraidCalculated: () => trackEvent("faraid_calculated"),

  // Engagement
  featureUsed: (feature: string) =>
    trackEvent("feature_used", { feature }),
  bugReported: () => trackEvent("bug_reported"),
  darkModeToggled: (mode: string) =>
    trackEvent("dark_mode_toggled", { mode }),
};
