/**
 * Accent colours for the phlebotomy page, taken from the site palette (forest, gold, rust, brass)
 * plus a deep red for the blood draw. Each entry gives a gradient for round icons, the icon colour
 * that reads best on it, a text colour, and a light tint for backgrounds and borders.
 */
export type Accent = {
  grad: [string, string];
  ink: string;
  text: string;
  tint: string;
  line: string;
};

export const ACCENTS: Accent[] = [
  { grad: ["#1f5a3f", "#0c2c1d"], ink: "#ffbe02", text: "#0c2c1d", tint: "rgba(12,44,29,0.07)", line: "rgba(12,44,29,0.22)" },
  { grad: ["#ffd45c", "#e6a800"], ink: "#0c2c1d", text: "#8a6200", tint: "rgba(255,190,2,0.13)", line: "rgba(230,168,0,0.38)" },
  { grad: ["#c1622a", "#9c4416"], ink: "#ffffff", text: "#9c4416", tint: "rgba(156,68,22,0.08)", line: "rgba(156,68,22,0.28)" },
  { grad: ["#cf3b30", "#8f1f1a"], ink: "#ffffff", text: "#9b2620", tint: "rgba(190,40,30,0.07)", line: "rgba(190,40,30,0.26)" },
  { grad: ["#b08a46", "#7d5a1f"], ink: "#ffffff", text: "#7d5a1f", tint: "rgba(153,115,49,0.09)", line: "rgba(153,115,49,0.3)" },
  { grad: ["#3f7a63", "#1f5a3f"], ink: "#ffffff", text: "#1f5a3f", tint: "rgba(31,90,63,0.08)", line: "rgba(31,90,63,0.26)" },
];

export const accentGradient = (a: Accent) => `linear-gradient(135deg, ${a.grad[0]}, ${a.grad[1]})`;
