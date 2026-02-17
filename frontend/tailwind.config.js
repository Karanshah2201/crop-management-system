/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                glass: "rgba(255, 255, 255, 0.25)",
                dark: "#0a0c0b",
                ice: {
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                },
                frost: {
                    DEFAULT: "#B9D9C3",
                    light: "#D4E6D9",
                    dark: "#9BB7A1",
                },
                moss: {
                    DEFAULT: "#2D4F3F",
                    light: "#3E6B56",
                    dark: "#1A2E25",
                }
            },
            fontFamily: {
                serif: ['"Cormorant Garamond"', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "zoom-in": {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                "slide-up": {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "scroll-reveal": {
                    "0%": { clipPath: "inset(100% 0 0 0)" },
                    "100%": { clipPath: "inset(0 0 0 0)" },
                }
            },
            animation: {
                "fade-in": "fade-in 0.8s ease-out forwards",
                "zoom-in": "zoom-in 0.8s ease-out forwards",
                "slide-up": "slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                "reveal": "scroll-reveal 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards",
            },
        },
    },
    plugins: [],
}
