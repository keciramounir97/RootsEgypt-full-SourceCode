/**
 * Tailwind CSS Configuration
 * RootsEgypt - Egyptian Heritage Color Palette
 */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
        md: "5px",
        lg: "6px",
        xl: "8px",
        "2xl": "10px",
        "3xl": "12px",
      },
      colors: {
        dark1: "#0a0e1a",
        dark2: "#0d1b2a",
        mutedSlate: "#7a8fa3",
        cloud: "#e8eef8",
        brand: "#0c4a6e",
        brandDark: "#083351",
        accent: "#c9a227",
        accentDark: "#a8871e",
        teal: "#0d9488",
        tealDark: "#0f766e",
        terracotta: "#c45c3e",
        sage: "#5c8570",
        sand: "#f3efe6",
        // Egyptian palette (Nile + desert + gold)
        "primary-brown": "#0c4a6e",
        "secondary-brown": "#1a6b94",
        "accent-gold": "#d4a84b",
        "light-beige": "#f5f0e8",
        "dark-beige": "#e5dccf",
        "paper-color": "#f7f3eb",
        "leather-brown": "#0f1729",
        "deep-brown": "#0a1220",
        "dark-coffee": "#060e1c",
        "text-color": "#2c3e50",
        "olive-green": "#0f766e",
        lotus: "#e8b4a0",
        "lotus-deep": "#c97d63",
        papyrus: "#f4e4c1",
        khamaseen: "#c9a88a",
        "nile-mist": "#e0f2f1",
        "date-palm": "#5a7c3a",
        "indigo-night": "#1e2a4a",
      },
      backgroundImage: {
        egyptGradient: "linear-gradient(120deg, #0c4a6e 0%, #0d9488 45%, #d4a84b 100%)",
        egyptHero: "linear-gradient(135deg, #0c4a6e 0%, rgba(13,148,136,0.45) 42%, #083351 100%)",
        /** Nile → teal → lotus: image/book card placeholders */
        mediaCard: "linear-gradient(145deg, rgba(12,74,110,0.14) 0%, rgba(13,148,136,0.1) 48%, rgba(232,180,160,0.18) 100%)",
        mediaCardSoft: "linear-gradient(145deg, rgba(12,74,110,0.1) 0%, rgba(13,148,136,0.06) 50%, rgba(212,168,75,0.08) 100%)",
      },
      boxShadow: {
        neu: "8px 8px 18px rgba(24, 32, 48, 0.12), -6px -6px 16px rgba(255, 255, 255, 0.85)",
        "neu-inset": "inset 4px 4px 10px rgba(24, 32, 48, 0.1), inset -3px -3px 8px rgba(255, 255, 255, 0.7)",
        "neu-dark": "6px 6px 14px rgba(0, 0, 0, 0.45), -3px -3px 10px rgba(255, 255, 255, 0.04)",
      },
      fontFamily: {
        cinzel: ["Cinzel", "URW Chancery L", "serif"],
        playfair: ["Playfair Display", "serif"],
        lastica: ["Lastica"],
        display: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};
