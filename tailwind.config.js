/** @type {import('tailwindcss').Config} */
const { addDynamicIconSelectors } = require('@iconify/tailwind')
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				'custom-gray': {
					1: '#21252b',
					2: '#282c34',
					3: '#333842',
				},
			},
		},
	},
	plugins: [require('daisyui'), addDynamicIconSelectors()],
	daisyui: {
		themes: ['pastel', 'night'],
	},
}
