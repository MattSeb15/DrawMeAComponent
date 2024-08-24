/** @type {import('tailwindcss').Config} */
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
	plugins: [require('daisyui')],
	daisyui: {
		themes: ['pastel', 'night'],
	},
}
