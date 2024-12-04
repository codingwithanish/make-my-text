/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"], // Match files in the sidepanel folder
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms"), // Optional plugin for better form styling
    require("@tailwindcss/typography"), // Optional plugin for styled prose
  ],
};