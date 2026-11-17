export type IconName =
  | "user"
  | "shield"
  | "bolt"
  | "clipboard"
  | "calendar"
  | "child"
  | "truck"
  | "drop"
  | "target"
  | "building"
  | "pin"
  | "box"
  | "phone"
  | "tubes"
  | "chat"
  | "check";

/** Soft second tone: the same colour as the outline, at low opacity, so each icon reads as duotone. */
const duo = { fill: "currentColor", fillOpacity: 0.22, stroke: "none" } as const;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  switch (name) {
    case "user":
      return (
        <svg className={className} {...common}>
          <circle cx="12" cy="8" r="4" {...duo} />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0Z" {...duo} />
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      );
    case "shield":
      return (
        <svg className={className} {...common}>
          <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" {...duo} />
          <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
          <path d="m9.5 12 2 2 3.5-4" />
        </svg>
      );
    case "bolt":
      return (
        <svg className={className} {...common}>
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" {...duo} />
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
        </svg>
      );
    case "clipboard":
      return (
        <svg className={className} {...common}>
          <rect x="6" y="4" width="12" height="17" rx="2" {...duo} />
          <rect x="6" y="4" width="12" height="17" rx="2" />
          <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
          <path d="M9 11h6M9 15h6" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={className} {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" {...duo} />
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      );
    case "child":
      return (
        <svg className={className} {...common}>
          <circle cx="12" cy="6" r="3" {...duo} />
          <path d="M6 21v-6a6 6 0 0 1 12 0v6Z" {...duo} />
          <circle cx="12" cy="6" r="3" />
          <path d="M6 21v-6a6 6 0 0 1 12 0v6" />
        </svg>
      );
    case "truck":
      return (
        <svg className={className} {...common}>
          <rect x="2" y="7" width="13" height="10" rx="1" {...duo} />
          <path d="M15 10h4l3 3v4h-7Z" {...duo} />
          <rect x="2" y="7" width="13" height="10" rx="1" />
          <path d="M15 10h4l3 3v4h-7z" />
          <circle cx="7" cy="19" r="1.6" fill="currentColor" fillOpacity={0.4} />
          <circle cx="18" cy="19" r="1.6" fill="currentColor" fillOpacity={0.4} />
        </svg>
      );
    case "drop":
      return (
        <svg className={className} {...common}>
          <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z" {...duo} />
          <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z" />
        </svg>
      );
    case "target":
      return (
        <svg className={className} {...common}>
          <circle cx="12" cy="12" r="8" {...duo} />
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="0.6" fill="currentColor" />
        </svg>
      );
    case "building":
      return (
        <svg className={className} {...common}>
          <rect x="4" y="3" width="16" height="18" rx="1" {...duo} />
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <path d="M9 21v-4h6v4M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01" />
        </svg>
      );
    case "pin":
      return (
        <svg className={className} {...common}>
          <path d="M12 21s7-6.5 7-11.5a7 7 0 0 0-14 0C5 14.5 12 21 12 21Z" {...duo} />
          <path d="M12 21s7-6.5 7-11.5a7 7 0 0 0-14 0C5 14.5 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.3" />
        </svg>
      );
    case "box":
      return (
        <svg className={className} {...common}>
          <path d="M21 8 12 3 3 8l9 5 9-5Z" {...duo} />
          <path d="M21 8 12 3 3 8l9 5 9-5Z" />
          <path d="M3 8v9l9 5 9-5V8M12 13v9" />
        </svg>
      );
    case "phone":
      return (
        <svg className={className} {...common}>
          <path d="M5 4h3.5l1.5 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 1.5V18a2 2 0 0 1-2 2C10.5 20 4 13.5 4 6a2 2 0 0 1 1-2Z" {...duo} />
          <path d="M5 4h3.5l1.5 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 1.5V18a2 2 0 0 1-2 2C10.5 20 4 13.5 4 6a2 2 0 0 1 1-2Z" />
        </svg>
      );
    case "tubes":
      return (
        <svg className={className} {...common}>
          <path d="M7 8h4v9a2 2 0 0 1-4 0Z" {...duo} />
          <path d="M13 9.5h3.4V15a1.7 1.7 0 0 1-3.4 0Z" {...duo} />
          <path d="M18 11.5h2.6V15a1.3 1.3 0 0 1-2.6 0Z" {...duo} />
          <path d="M7 3v14a2 2 0 0 0 4 0V3M7 8h4" />
          <path d="M13 6v9a1.7 1.7 0 0 0 3.4 0V6M13 9.5h3.4" />
          <path d="M18 9v6a1.3 1.3 0 0 0 2.6 0V9M18 11.5h2.6" />
        </svg>
      );
    case "chat":
      return (
        <svg className={className} {...common}>
          <path d="M4 5h16v11H9l-5 4V5Z" {...duo} />
          <path d="M4 5h16v11H9l-5 4V5Z" />
          <path d="M8 9.5h8M8 12.5h5" />
        </svg>
      );
    case "check":
      return (
        <svg className={className} {...common}>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      );
    default:
      return null;
  }
}
