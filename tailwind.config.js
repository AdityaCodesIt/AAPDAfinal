/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-on-surface": "#303030",
        "on-primary": "#1a1c1c",
        "surface-bright": "#393939",
        "surface-dim": "#131313",
        "on-secondary-fixed-variant": "#3b3b3b",
        "surface-tint": "#c6c6c7",
        "inverse-primary": "#5d5f5f",
        "surface-variant": "#353535",
        "on-primary-fixed": "#ffffff",
        "primary-fixed": "#5d5f5f",
        "error": "#ffb4ab",
        "on-error": "#690005",
        "surface-container-high": "#2a2a2a",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-highest": "#353535",
        "outline": "#919191",
        "secondary-fixed": "#c8c6c6",
        "background": "transparent",
        "on-primary-fixed-variant": "#e2e2e2",
        "secondary-fixed-dim": "#acabaa",
        "primary": "#ffffff",
        "on-surface": "#e2e2e2",
        "tertiary-container": "#919090",
        "on-tertiary-fixed": "#ffffff",
        "secondary-container": "#474747",
        "on-tertiary": "#1b1c1c",
        "tertiary": "#e4e2e2",
        "on-secondary-fixed": "#1b1c1c",
        "primary-fixed-dim": "#454747",
        "error-container": "#93000a",
        "primary-container": "#d4d4d4",
        "surface-container": "#1f1f1f",
        "on-secondary": "#1b1c1c",
        "tertiary-fixed-dim": "#464747",
        "on-error-container": "#ffdad6",
        "outline-variant": "#474747",
        "on-tertiary-container": "#000000",
        "inverse-surface": "#e2e2e2",
        "on-background": "#e2e2e2",
        "on-primary-container": "#000000",
        "surface-container-low": "#1b1b1b",
        "surface": "#131313",
        "on-surface-variant": "#c6c6c6",
        "tertiary-fixed": "#5e5e5e",
        "on-secondary-container": "#e4e2e1"
      },
      borderRadius: {
        "DEFAULT": "0px",
        "lg": "0px",
        "xl": "0px",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Space Grotesk"],
        "body": ["Inter"],
        "label": ["Space Grotesk"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
