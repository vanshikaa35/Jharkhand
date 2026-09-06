/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Base pastel system — "Dreamy Pastel" palette
        sage: {
          DEFAULT: "#F0F8FF", // Mint Frost
          dark: "#CFDBC5", // Sage Mist
        },
        cream: "#FFF6F3", // soft neutral, kin to Peach Sorbet
        ink: {
          DEFAULT: "#3B254B", // deep plum-grey, pairs with Lavender Dusk
          soft: "#6B5B6E",
        },
        // Pop accent — used sparingly for actions/status
        marigold: {
          DEFAULT: "#8C5F94", // deepened Lavender Dusk (AA-contrast vs white)
          dark: "#7A4F82",
          light: "#F0E4F0",
        },
        // Secondary tag colors
        sky: {
          DEFAULT: "#C6EFF0", // Frost
          dark: "#A9E0E6",
        },
        blush: {
          DEFAULT: "#FFD1DC", // Blush Sky
          dark: "#F2A9BC",
        },
        // New accents introduced by the palette
        peach: {
          DEFAULT: "#FFE4E1", // Peach Sorbet
          dark: "#F7C2BC",
        },
        lavender: {
          DEFAULT: "#D8BFD8", // Lavender Dusk
          dark: "#BE9CBE",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        blob: "60% 40% 55% 45% / 45% 55% 45% 55%",
      },
    },
  },
  plugins: [],
};
