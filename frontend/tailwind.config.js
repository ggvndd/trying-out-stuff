/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Montserrat', 'sans-serif'],
            },
            colors: {
                orionBlue: '#0030FF',
                orionYellow: '#FACC15',
                orionDark: '#0a0a2a'
            }
        },
    },
    plugins: [],
}
