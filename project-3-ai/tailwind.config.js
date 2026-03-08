/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/frontend/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		fontFamily: {
			sans: ['Inter', 'system-ui', 'sans-serif'],
		},
	},
}
