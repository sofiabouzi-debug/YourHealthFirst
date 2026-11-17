/**
 * Six duotone icons for the appointment steps. Each one has a small part that moves when its step
 * is reached (see the .phl-* rules in globals.css). Without JavaScript, or with "reduce motion",
 * they simply show their finished state.
 */
export type StepIconName = "book" | "prepare" | "arrive" | "draw" | "centrifuge" | "dispatch";

const duo = { fill: "currentColor", fillOpacity: 0.22, stroke: "none" } as const;

export function StepIcon({ name, className }: { name: StepIconName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  const cls = `phl-ico ${className ?? ""}`;

  switch (name) {
    case "book":
      return (
        <svg className={cls} {...common}>
          <g className="phl-phone">
            <path d="M5 4h3.5l1.5 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 1.5V18a2 2 0 0 1-2 2C10.5 20 4 13.5 4 6a2 2 0 0 1 1-2Z" {...duo} />
            <path d="M5 4h3.5l1.5 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 1.5V18a2 2 0 0 1-2 2C10.5 20 4 13.5 4 6a2 2 0 0 1 1-2Z" />
          </g>
          <path className="phl-wave" d="M15 4.2a5 5 0 0 1 4.8 4.8" />
          <path className="phl-wave w2" d="M15 1.2a8 8 0 0 1 7.8 7.8" />
        </svg>
      );
    case "prepare":
      return (
        <svg className={cls} {...common}>
          <rect x="6" y="4" width="12" height="17" rx="2" {...duo} />
          <rect x="6" y="4" width="12" height="17" rx="2" />
          <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
          <path d="M9 9h6" />
          <path className="phl-tick" d="m9 14.5 2.2 2.2 4.2-4.7" />
        </svg>
      );
    case "arrive":
      return (
        <svg className={cls} {...common}>
          <ellipse className="phl-ripple" cx="12" cy="20.6" rx="5" ry="1.6" strokeWidth={1.2} />
          <g className="phl-pin">
            <path d="M12 19s6-5.2 6-9.8a6 6 0 0 0-12 0C6 13.8 12 19 12 19Z" {...duo} />
            <path d="M12 19s6-5.2 6-9.8a6 6 0 0 0-12 0C6 13.8 12 19 12 19Z" />
            <circle cx="12" cy="9.2" r="2.2" />
          </g>
        </svg>
      );
    case "draw":
      return (
        <svg className={cls} {...common}>
          <path d="M9 7h6" />
          <path d="M10 7v11a2 2 0 0 0 4 0V7" />
          <path className="phl-fill" d="M10 12h4v6a2 2 0 0 1-4 0Z" fill="currentColor" fillOpacity={0.55} stroke="none" />
          <path
            className="phl-drop"
            d="M12 1.6s1.7 2.1 1.7 3.4a1.7 1.7 0 0 1-3.4 0c0-1.3 1.7-3.4 1.7-3.4Z"
            fill="currentColor"
            fillOpacity={0.4}
          />
        </svg>
      );
    case "centrifuge":
      return (
        <svg className={cls} {...common}>
          <circle cx="12" cy="12" r="9" {...duo} />
          <circle cx="12" cy="12" r="9" />
          <g className="phl-rotor">
            <path d="M12 12V6M12 12v6M12 12H6M12 12h6" strokeWidth={2.6} />
          </g>
          <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
        </svg>
      );
    case "dispatch":
      return (
        <svg className={cls} {...common}>
          <path d="M5 10.5h14V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z" {...duo} />
          <path d="M5 10.5h14V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z" />
          <path d="M10 14.5h4" />
          <g className="phl-lid">
            <path d="M4 7h16v3.5H4Z" {...duo} />
            <path d="M4 7h16v3.5H4Z" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}
