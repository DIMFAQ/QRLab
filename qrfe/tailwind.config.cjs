/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        steelblue: "#4682b4",
        dimgray: "#696969",
        slategray: "#6a7282",
        whitesmoke: "#f5f5f5",
        gray: "#333333",
        mediumslateblue: "#155dfc",
        forestgreen: "#00a63e",
        blueviolet: "#9810fa",
        orangered: "#f54900",
        gainsboro: "#d9d9d9",
      },
      spacing: {
        "num-61": "61px",
        "num-122": "122px",
        "num-52": "52px",
      },
      borderRadius: {
        "num-14": "14px",
      },
      padding: {
        "num-24": "24px",
        "num-0": "0px",
      },
      fontFamily: {
        arya: ['"Arya"', "sans-serif"],
        arimo: ['"Arimo"', "sans-serif"],
      },
      fontSize: {
        "num-12": "0.75rem",
        "num-16": "1rem",
        "num-10": "0.625rem",
      },
      lineHeight: {
        "num-20": "20px",
      },
      boxShadow: {
        card: "0 20px 45px -25px rgba(15,23,42,0.45)",
      },
    },
  },
  plugins: [],
};
