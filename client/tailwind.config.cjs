/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#06283F",
        secondary: "#3AB3E7",
        accent: "#C3EAFF",
        extra: "#0D80A3",
        dimWhite: "rgba(255, 255, 255, 0.7)",
        dimBlue: "rgba(6, 40, 63, 0.94)",
        gradBlueLight: "#39CBFA66",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
}