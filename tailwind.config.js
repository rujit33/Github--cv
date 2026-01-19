/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        github: {
          dark: "#0d1117",
          gray: "#161b22",
          border: "#30363d",
          text: "#c9d1d9",
          link: "#58a6ff",
          green: "#238636",
        },
      },
    },
  },
  plugins: [],
};
