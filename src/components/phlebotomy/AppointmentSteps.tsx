"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./icons";
import { StepIcon, type StepIconName } from "./StepIcons";
import { ACCENTS, accentGradient } from "./accents";

export type JourneyStep = { icon: StepIconName; title: string; text: string };

/**
 * "How an appointment works": a compact, colourful strip. On a wide screen the six steps sit in one
 * row with a line running through their icons. When the strip scrolls into view the steps switch on
 * one after another, the line fills from left to right, and each icon plays a short animation once.
 * All the text is in the page from the start, so search engines and visitors without JavaScript or
 * with "reduce motion" see everything, with the icons in their finished state.
 */
export default function AppointmentSteps({
  steps,
  note,
  bookHref,
}: {
  steps: JourneyStep[];
  note: ReactNode;
  bookHref: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [playedCount, setPlayedCount] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const timers: number[] = [];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // show every step as already reached, without any movement
      timers.push(window.setTimeout(() => setPlayedCount(steps.length), 0));
      return () => timers.forEach((t) => window.clearTimeout(t));
    }

    timers.push(window.setTimeout(() => setReady(true), 0));
    const start = () => {
      steps.forEach((_, i) => {
        timers.push(window.setTimeout(() => setPlayedCount((c) => Math.max(c, i + 1)), 150 + i * 520));
      });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
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
  }, [steps]);

  const fillPct = steps.length > 1 ? (Math.max(playedCount - 1, 0) / (steps.length - 1)) * 100 : 0;

  return (
    <section className="w-full px-5">
      <div className="mx-auto max-w-[1400px] py-[56px] lg:py-[72px]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <span className="h-[3px] w-12 rounded-full bg-tan" />
            <h2 className="font-display text-[30px] font-bold leading-[36px] tracking-[-1px] text-forest uppercase lg:text-[36px] lg:leading-[42px]">
              How an appointment works
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="inline-flex items-center gap-3 rounded-full border border-tan/40 bg-cream px-5 py-3 text-[14px] leading-[20px] text-body-text">
              {note}
            </p>
            <a
              href={bookHref}
              className="inline-flex h-12 items-center gap-3 rounded-[10px] bg-forest px-6 font-nav text-[13px] font-semibold tracking-[0.5px] text-white uppercase transition-opacity hover:opacity-90"
            >
              <Icon name="mail" className="h-4 w-4" />
              Email to book
            </a>
          </div>
        </div>

        <div ref={wrapRef} className={`${ready ? "phl-ready " : ""}relative mt-10`}>
          {/* The line that runs through the six icons (wide screens only) */}
          <div
            aria-hidden="true"
            className="absolute top-[34px] left-[36px] hidden h-[4px] w-[calc((100%+24px)*5/6)] rounded-full bg-tan/25 xl:block"
          >
            <span
              className="block h-full rounded-full transition-[width] duration-500 ease-linear"
              style={{
                width: `${fillPct}%`,
                background: "linear-gradient(90deg,#1f5a3f,#ffbe02,#9c4416,#cf3b30,#b08a46,#3f7a63)",
              }}
            />
          </div>

          <ol className="relative grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3 xl:grid-cols-6">
            {steps.map((s, i) => {
              const a = ACCENTS[i % ACCENTS.length];
              const on = i < playedCount;
              return (
                <li
                  key={s.title}
                  className={`phl-step flex flex-row items-start gap-4 sm:flex-col ${on ? "is-played" : ""}`}
                >
                  <span
                    className="relative z-10 flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-[3px] border-white transition-all duration-500"
                    style={
                      on
                        ? {
                            background: accentGradient(a),
                            color: a.ink,
                            boxShadow: `0 10px 22px -8px ${a.grad[1]}, 0 0 0 2px ${a.line}`,
                          }
                        : { background: "#fff", color: a.text, boxShadow: `0 0 0 2px ${a.line}` }
                    }
                  >
                    {ready && !on ? (
                      <span className="font-nav text-[20px] font-semibold">{i + 1}</span>
                    ) : (
                      <StepIcon name={s.icon} className="h-9 w-9" />
                    )}
                  </span>
                  <div
                    className="min-w-0 flex-1 rounded-[16px] border p-4 sm:w-full"
                    style={{ background: a.tint, borderColor: a.line }}
                  >
                    <h3
                      className="font-subheading text-[14px] font-bold tracking-[1.2px] uppercase"
                      style={{ color: a.text }}
                    >
                      <span className="mr-1.5 opacity-60">{i + 1}.</span>
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-[22px] text-body-text">{s.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
