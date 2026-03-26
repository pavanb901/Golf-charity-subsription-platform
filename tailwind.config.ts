import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#13151A",
        mist: "#F5F1E8",
        ember: "#E45F35",
        pine: "#1E7A66",
        gold: "#D8B25C",
        slate: "#48515D"
      },
      fontFamily: {
        sans: ["Manrope", "Avenir", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Avenir Next", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        panel: "0 24px 80px rgba(19, 21, 26, 0.12)"
      },
      backgroundImage: {
        glow:
          "radial-gradient(circle at top left, rgba(228, 95, 53, 0.16), transparent 38%), radial-gradient(circle at bottom right, rgba(30, 122, 102, 0.2), transparent 32%)"
      }
    }
  },
  plugins: []
};

export default config;
