"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { StepIcon, type StepIconName } from "./StepIcons";
import { Icon } from "./icons";
import { ACCENTS, accentGradient } from "./accents";

const reasons: { icon: StepIconName; title: string; text: string; accent: number }[] = [
  { icon: "hydrate", title: "Easier Vein Access", text: "Hydration increases blood flow and makes your veins more prominent, ensuring a smoother blood draw.", accent: 5 },
  { icon: "accuracy", title: "Accurate Results", text: "Other beverages contain compounds or sugars that can alter your test results, while plain water does not.", accent: 1 },
  { icon: "norepeat", title: "Avoid Retests", text: "Following proper instructions for fasting and hydration can prevent the need to repeat the blood test.", accent: 3 },
];

/**
 * "Why it matters": the three reasons from the original page, plus the children and courier rules,
 * in the same coloured style as the rest of the page. The icons play a short animation once when the
 * block scrolls into view. All text is in the page from the start, and with "reduce motion" or no
 * JavaScript the icons simply show their finished state.
 */
export default function WhyItMatters({ kids, courier }: { kids: ReactNode; courier: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [playedCount, setPlayedCount] = useState(0);
  const total = reasons.length + 1;

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
  const rust = ACCENTS[2];

  return (
    <section className="relative w-full overflow-hidden bg-[linear-gradient(135deg,#faf4ea_0%,#f0e0c8_100%)] px-5">
      <div className="pointer-events-none absolute -right-[10%] -top-[10%] h-[450px] w-[450px] rounded-full bg-tan/15 blur-[110px]" />
      <div className="pointer-events-none absolute -left-[10%] bottom-[-15%] h-[450px] w-[450px] rounded-full bg-white/40 blur-[110px]" />
      <div className="relative mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-2">
            <span className="h-[3px] w-12 rounded-full bg-tan" />
            <h2 className="font-display text-[30px] font-bold leading-[36px] tracking-[-1px] text-forest uppercase lg:text-[36px] lg:leading-[42px]">
              Why it <span className="text-tan">matters</span>
            </h2>
          </div>
          <p className="max-w-[420px] text-[15px] leading-[24px] text-body-text lg:text-right">
            Following a few simple guidelines helps ensure a smoother blood draw and more reliable test results.
          </p>
        </div>

        <div ref={wrapRef} className={`${ready ? "phl-ready " : ""}mt-8 flex flex-col gap-5`}>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {reasons.map((r, i) => {
              const a = ACCENTS[r.accent];
              const on = i < playedCount;
              return (
                <li
                  key={r.title}
                  className={`phl-step flex items-start gap-4 rounded-[18px] border p-5 ${on ? "is-played" : ""}`}
                  style={{ background: a.tint, borderColor: a.line, borderTop: `4px solid ${a.grad[0]}` }}
                >
                  <span
                    className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full border-[3px] border-white"
                    style={{ background: accentGradient(a), color: a.ink, boxShadow: `0 8px 18px -8px ${a.grad[1]}, 0 0 0 2px ${a.line}` }}
                  >
                    <StepIcon name={r.icon} className="h-8 w-8" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-subheading text-[15px] font-bold tracking-[1.2px] uppercase" style={{ color: a.text }}>
                      {r.title}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-[22px] text-body-text">{r.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div
              className="flex items-center gap-4 rounded-[18px] border p-5"
              style={{ background: rust.tint, borderColor: rust.line, borderLeft: `4px solid ${rust.grad[0]}` }}
            >
              <span
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full shadow-sm"
                style={{ background: accentGradient(rust), color: rust.ink }}
              >
                <Icon name="child" className="h-6 w-6" />
              </span>
              <p className="text-[15px] leading-[24px] text-body-text">{kids}</p>
            </div>
            <div
              className={`phl-step flex items-center gap-4 rounded-[18px] border p-5 ${playedCount >= total ? "is-played" : ""}`}
              style={{ background: gold.tint, borderColor: gold.line, borderLeft: `4px solid ${gold.grad[0]}` }}
            >
              <span
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full shadow-sm"
                style={{ background: accentGradient(gold), color: gold.ink }}
              >
                <StepIcon name="truck" className="h-7 w-7" />
              </span>
              <p className="text-[15px] leading-[24px] text-body-text">{courier}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
