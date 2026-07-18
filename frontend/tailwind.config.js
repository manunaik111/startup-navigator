/** @type {import('tailwindcss').Config} **/
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                navy: { DEFAULT: "#101B33", light: "#1B2C4F", 50: "#E9ECF3" },
                gold: { DEFAULT: "#D9A441", light: "#EFC876", dark: "#B3822E" },
                paper: "#F6F4EF",
                slate: { DEFAULT: "#3C4257", light: "#6B7288" },
                teal: { DEFAULT: "#2F6F63", light: "#4C9284" },
            },
            fontFamily: {
                display: ["var(--font-fraunces)", "serif"],
                body: ["var(--font-inter)", "sans-serif"],
                mono: ["var(--font-plex-mono)", "monospace"],
            },
            backgroundImage: {
                "route-dots": "radial-gradient(circle, rgba(217,164,65,0.4) 1.5px, transparent 1.5px)",
            },
        },
    },
    plugins: [],
};