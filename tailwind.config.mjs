module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: "class",
	theme: {
	  extend: {
		fontSize: {
		  '1.05rem': ['1.05rem', {lineHeight: '1.75rem'}]
		},
		fontFamily: {
		  'mono': ['Anonymous Pro']
		},
		colors: {
		  bgColor: "var(--theme-bg)",
		  textColor: "var(--theme-text)",
		  link: "var(--theme-link)",
		  accent: "var(--theme-accent)",
		  'accent-2': "var(--theme-accent-2)",
		  surface: "var(--theme-surface)",
		  quote: "var(--theme-quote)",
		  highlight: "var(--theme-highlight)"
		},
	  }
	},
	plugins: [
	  require('@tailwindcss/typography'),
	],
  }
  