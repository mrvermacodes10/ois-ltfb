import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Token names kept stable (pitch-black, chalk, green-lunch, gold)
        // even though their values are now a light, clean palette — this is
        // deliberate: it means every existing `bg-pitch-black`,
        // `text-chalk/NN`, `border-chalk/10`, `bg-green-lunch`, `text-gold`
        // etc. used across the whole site (70+ files) renders correctly
        // under the new design with zero per-file changes.
        pitch: { black: "#FFFFFF", turf: "#FFFFFF", line: "#E4E7EC" },
        green: { lunch: "#1E7A3C", deep: "#145C2C" },
        chalk: "#13161C",
        gold: "#9A6F09",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
