// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary': '#1a202c', // A very dark, near-black gray
        'secondary': '#00f5d4', // A vibrant, glowing green/cyan
        'accent': '#9b5de5',   // A pop of purple for contrast if needed
        'base-100': '#2d3748', // A slightly lighter dark gray for cards/modals
        'text-primary': '#f7fafc', // Off-white for primary text
        'text-secondary': '#a0aec0', // A dimmer gray for secondary text
      },
      boxShadow: {
        'glow': '0 0 15px rgba(0, 245, 212, 0.4)',
      }
    },
  },
  plugins: [],
};