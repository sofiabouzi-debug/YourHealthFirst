"use client";

import { useEffect } from "react";

/**
 * Sends a Google Analytics event whenever a visitor taps a way to contact the clinic:
 *   click_call        phone number links (tel:)
 *   click_email       email links (mailto:)
 *   click_whatsapp    WhatsApp links (wa.me, api.whatsapp.com)
 *   click_directions  Google Maps links
 * One listener covers every page and every button, including ones added later, so new pages
 * are tracked without any extra work. Form sends are reported separately by the contact form
 * (event generate_lead).
 *
 * Privacy: the events carry only the page address, the link address and the visible button
 * text. No personal details are collected. They follow the visitor's cookie choice because
 * Google Analytics runs in Consent Mode (analytics storage stays denied until accepted).
 */
type EventName = "click_call" | "click_email" | "click_whatsapp" | "click_directions";

function eventFor(href: string): EventName | null {
  if (href.startsWith("tel:")) return "click_call";
  if (href.startsWith("mailto:")) return "click_email";
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|wa\.link)\//i.test(href)) return "click_whatsapp";
  if (/google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(href)) return "click_directions";
  return null;
}

export default function LeadTracking() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const link = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      const name = eventFor(href);
      if (!name || typeof window.gtag !== "function") return;
      window.gtag("event", name, {
        link_url: href.split("?")[0],
        link_text: (link.textContent ?? "").trim().slice(0, 60),
        page_path: window.location.pathname,
      });
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
