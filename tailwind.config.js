/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6C3FCF",
        background: "#F5F5F7",
        card: "#FFFFFF",
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B7280",
        border: "#E5E7EB",
        success: "#3B6D11",
        "success-bg": "#EAF3DE",
        warning: "#854F0B",
        "warning-bg": "#FAEEDA",
      },
    },
  },
  plugins: [],
}
