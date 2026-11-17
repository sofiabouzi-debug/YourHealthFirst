"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./icons";
import { StepIcon, type StepIconName } from "./StepIcons";

export type JourneyStep = { icon: StepIconName; title: string; text: string };

/**
 * "How an appointment works". A vertical rail connects the six steps. As the visitor scrolls, the
 * rail fills and each step switches on once (its icon plays a short animation, one time only).
 * All the text is in the page from the start, so search engines and visitors without JavaScript
 * or with "reduce motion" see everything, with the icons in their finished state.
 */
export default function AppointmentSteps({
  steps,
  note,
  phoneHref,
}: {
  steps: JourneyStep[];
  note: ReactNode;
  phoneHref: string;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  const [rail, setRail] = useState({ top: 0, length: 0, fill: 0 });
  const [played, setPlayed] = useState<boolean[]>(() => steps.map(() => false));

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const listTop = list.getBoundingClientRect().top;
      return circleRefs.current.map((c) => {
        if (!c) return 0;
        const r = c.getBoundingClientRect();
        return r.top - listTop + r.height / 2;
      });
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const offs = measure();
      const first = offs[0] ?? 0;
      const last = offs[offs.length - 1] ?? 0;
      setRail({ top: first, length: last - first, fill: last - first });
      setPlayed(steps.map(() => true));
      return;
    }

    setReady(true);
    let frame = 0;
    const update = () => {
      frame = 0;
      const offs = measure();
      const first = offs[0] ?? 0;
      const last = offs[offs.length - 1] ?? 0;
      // The "reading line" sits about 60% of the way down the screen.
      const trigger = window.innerHeight * 0.62 - list.getBoundingClientRect().top;
      const fill = Math.min(Math.max(trigger - first, 0), last - first);
      setRail({ top: first, length: last - first, fill });
      setPlayed((prev) => {
        const next = prev.map((p, i) => p || trigger >= offs[i]);
        return next.every((v, i) => v === prev[i]) ? prev : next;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [steps]);

  const railLeft = "calc(var(--w) / 2 - 1.5px)";

  return (
    <section className="w-full px-5">
      <div className="mx-auto max-w-[1400px] py-[70px] lg:py-[90px]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="flex flex-col gap-5 lg:sticky lg:top-[130px] lg:self-start">
            <div className="flex flex-col gap-2">
              <span className="h-[3px] w-12 rounded-full bg-tan" />
              <h2 className="font-display text-[30px] font-bold leading-[36px] tracking-[-1px] text-forest uppercase lg:text-[36px] lg:leading-[42px]">
                How an appointment works
              </h2>
            </div>
            <p className="max-w-[440px] text-[16px] leading-[27px] text-body-text">
              Six steps, from the first call to sending your sample.
            </p>
            <p className="inline-flex w-fit items-center gap-3 rounded-full border border-tan/40 bg-cream px-5 py-3 text-[14px] leading-[20px] text-body-text">
              {note}
            </p>
            <a
              href={phoneHref}
              className="inline-flex h-14 w-fit items-center gap-3 rounded-[10px] bg-forest px-7 font-nav text-[14px] font-semibold tracking-[0.5px] text-white uppercase transition-opacity hover:opacity-90"
            >
              <Icon name="phone" className="h-4 w-4" />
              Call us to book
            </a>
          </div>

          <ol
            ref={listRef}
            className={`${ready ? "phl-ready " : ""}relative flex flex-col gap-6 [--w:56px] md:[--w:68px]`}
          >
            {rail.length > 0 && (
              <>
                <span
                  aria-hidden="true"
                  className="absolute w-[3px] rounded-full bg-tan/25"
                  style={{ left: railLeft, top: rail.top, height: rail.length }}
                />
                <span
                  aria-hidden="true"
                  className="absolute w-[3px] rounded-full bg-gradient-to-b from-tan to-forest"
                  style={{ left: railLeft, top: rail.top, height: rail.fill }}
                />
              </>
            )}
            {steps.map((s, i) => (
              <li key={s.title} className={`phl-step flex items-start gap-5 ${played[i] ? "is-played" : ""}`}>
                <span
                  ref={(el) => {
                    circleRefs.current[i] = el;
                  }}
                  className={`relative z-10 flex h-[var(--w)] w-[var(--w)] shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                    played[i] ? "border-tan bg-tan text-white shadow-md" : "border-tan/40 bg-white text-tan"
                  }`}
                >
                  {ready && !played[i] ? (
                    <span className="font-nav text-[18px] font-semibold md:text-[20px]">{i + 1}</span>
                  ) : (
                    <StepIcon name={s.icon} className="h-7 w-7 md:h-8 md:w-8" />
                  )}
                </span>
                <div className="relative min-w-0 flex-1 overflow-hidden rounded-[20px] border border-tan/25 bg-[#faf4ea] p-6 md:p-7">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-1 -top-5 select-none font-display text-[110px] leading-none font-bold text-tan/20"
                  >
                    {i + 1}
                  </span>
                  <h3 className="relative font-subheading text-[15px] font-semibold tracking-[1px] text-forest uppercase">
                    {s.title}
                  </h3>
                  <p className="relative mt-2 text-[15px] leading-[24px] text-body-text">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
