import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const v = (name: string) => `var(--${name})`;

const feature = (name: string) => ({
  DEFAULT: v(name),
  tint: v(`${name}-tint`),
  text: v(`${name}-text`),
});

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: v("bg"),
        surface: v("surface"),
        ink: { DEFAULT: v("ink"), soft: v("ink-soft") },
        line: v("line"),
        primary: {
          DEFAULT: v("primary"),
          ink: v("primary-ink"),
          soft: v("primary-soft"),
          "soft-ink": v("primary-soft-ink"),
        },
        danger: { DEFAULT: v("danger"), tint: v("danger-tint") },
        goals: feature("goals"),
        meetings: feature("meetings"),
        decisions: feature("decisions"),
        opps: feature("opps"),
        projects: feature("projects"),
        library: feature("library"),
        directory: feature("directory"),
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "16px", panel: "24px" },
      fontSize: {
        "display-xl": ["clamp(2.75rem, 7vw, 5.5rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.25rem, 5vw, 3.75rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
