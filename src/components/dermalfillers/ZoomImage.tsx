"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
};

/** A small picture that opens full size when tapped. Closes with a click, the close button or Esc. */
export default function ZoomImage({ src, alt, caption = "Tap to enlarge", className = "" }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${alt} (opens a larger version)`}
        className={`group relative block overflow-hidden rounded-[14px] border border-black/10 bg-white p-2 text-left shadow-md transition-shadow hover:shadow-lg ${className}`}
      >
        <Image src={src} alt={alt} width={900} height={900} sizes="420px" className="h-auto w-full rounded-[8px] object-contain" />
        <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-[#241a0f]/85 px-3 py-1.5 font-nav text-[12px] font-semibold text-cream">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5M11 8v6M8 11h6" />
          </svg>
          {caption}
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#241a0f] shadow-lg"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div className="relative max-h-full max-w-[min(92vw,820px)] overflow-auto rounded-[12px] bg-white p-3" onClick={(e) => e.stopPropagation()}>
            <Image src={src} alt={alt} width={1400} height={1400} sizes="820px" className="h-auto max-h-[88vh] w-auto object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
