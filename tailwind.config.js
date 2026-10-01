// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F9F7F4", // warm off-white / studio canvas
        surface: "#FFFFFF", // clean crisp white
        primary: "#3B2417", // rich deep leather espresso brown
        "primary-hover": "#29180E",
        "primary-light": "#F0EAE1",
        brown: {
          dark: "#24140B",
          medium: "#5A3825",
          leather: "#3B2417",
          light: "#8A6046",
          soft: "#F4EFEA",
        },
        heading: "#1C1917", // deep charcoal text
        muted: "#736B63", // soft warm grey
        border: "#E8E3DA", // warm clean border
      },
      fontFamily: {
        sans: ["Switzer", "sans-serif"], // body text, labels, buttons
        serif: ["Fraunces", "serif"], // headings, titles
      },
    },
  },
};
