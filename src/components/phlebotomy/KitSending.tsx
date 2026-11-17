"use client";

import { useEffect, useRef, useState } from "react";
import { StepIcon, type StepIconName } from "./StepIcons";
import { ACCENTS, accentGradient } from "./accents";

type Option = { icon: StepIconName; title: string; tag: string; text: string; accent: number };

const options: Option[] = [
  { icon: "post", title: "Post Office", tag: "Walk it in", text: "The nearest branch is less than a 10-minute walk from the clinic.", accent: 3 },
  { icon: "dropoff", title: "UPS", tag: "Drop-off point", text: "A UPS drop-off point is 5 minutes from the clinic.", accent: 4 },
  { icon: "truck", title: "DHL", tag: "Collection", text: "Once we confirm your appointment, call DHL and ask them to collect from your home or the clinic between 3pm and 5pm.", accent: 1 },
  { icon: "pickup", title: "FedEx", tag: "Collection", text: "Once we confirm your appointment, call FedEx and ask them to collect from your home or the clinic between 3pm and 5pm.", accent: 0 },
];

/**
 * "Sending your kit": the courier rule as a dark banner, then the four ways to send the sample as
 * four coloured cards. When the block scrolls into view the icons switch on one after another and
 * each plays a short animation once. All the text is in the page from the start; without JavaScript
 * or with "reduce motion" the icons simply show their finished state.
 */
export default function KitSending() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [playedCount, setPlayedCount] = useState(0);
  const total = options.length + 1;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const timers: number[] = [];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timers.push(window.setTimeout(() => setPlayedCount(total), 0));
      return () => timers.forEach((t) => window.clearTimeout(t));
    }

    timers.push(window.setTimeout(() => setReady(true), 0));
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          for (let i = 0; i < total; i++) {
            timers.push(window.setTimeout(() => setPlayedCount((c) => Math.max(c, i + 1)), 150 + i * 450));
          }
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [total]);

  const gold = ACCENTS[1];

  return (
    <div ref={wrapRef} className={`${ready ? "phl-ready " : ""}mt-10 flex flex-col gap-5`}>
      {/* The courier rule */}
      <div
        className={`phl-step relative flex flex-col gap-4 overflow-hidden rounded-[20px] bg-forest p-6 shadow-md sm:flex-row sm:items-center sm:gap-6 sm:p-7 ${
          playedCount > 0 ? "is-played" : ""
        }`}
      >
        <div className="pointer-events-none absolute -right-10 -top-16 h-[220px] w-[220px] rounded-full bg-tan/15 blur-[70px]" />
        <span
          className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-[3px] border-white/90"
          style={{ background: accentGradient(gold), color: gold.ink, boxShadow: "0 10px 22px -8px #e6a800" }}
        >
          <StepIcon name="truck" className="h-9 w-9" />
        </span>
        <div className="relative flex flex-col gap-1.5">
          <h3 className="font-subheading text-[14px] font-bold tracking-[1.5px] text-tan uppercase">If your test needs a courier</h3>
          <p className="text-[15px] leading-[24px] text-white/85">
            Book a <strong className="font-semibold text-tan">morning appointment, Monday to Thursday</strong>, and arrange collection from the clinic the same day between 3pm and 5pm. If your form requires it, we can freeze the sample and hold it at the clinic until the courier collects it.
          </p>
        </div>
      </div>

      {/* Four ways to send the sample */}
      <p className="text-[15px] leading-[24px] text-body-text">
        Your kit gives you up to four ways to send the sample. Which one you use depends on the laboratory.
      </p>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {options.map((o, i) => {
          const a = ACCENTS[o.accent];
          const on = i + 1 < playedCount;
          return (
            <li
              key={o.title}
              className={`phl-step flex flex-col gap-3 rounded-[16px] border p-5 ${on ? "is-played" : ""}`}
              style={{ background: a.tint, borderColor: a.line, borderTop: `4px solid ${a.grad[0]}` }}
            >
              <div className="flex items-center gap-4">
                <span
                  className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border-[3px] border-white"
                  style={{ background: accentGradient(a), color: a.ink, boxShadow: `0 8px 18px -8px ${a.grad[1]}, 0 0 0 2px ${a.line}` }}
                >
                  <StepIcon name={o.icon} className="h-8 w-8" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-subheading text-[16px] font-bold tracking-[1px] uppercase" style={{ color: a.text }}>
                    {o.title}
                  </h3>
                  <span className="text-[12px] font-semibold tracking-[0.5px] text-body-text/70">{o.tag}</span>
                </div>
              </div>
              <p className="text-[14px] leading-[22px] text-body-text">{o.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
