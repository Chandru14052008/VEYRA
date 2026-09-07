/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#0B1324",
        inksoft: "#5B6472",
        accent: "#0EA5B7",
        brand: "#12213E",
      },
      borderRadius: { xl2: "16px" },
    },
  },
  plugins: [],
};
