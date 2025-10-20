import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      // ABACO Financial Intelligence Platform colors
      colors: {
        abaco: {
          primary: {
            light: '#C1A6FF',
            DEFAULT: '#A855F7', 
            dark: '#5F4896',
          },
          background: '#030E19',
          surface: '#1E293B',
          accent: '#8B5CF6',
        },
      },
      fontFamily: {
        'lato': ['Lato', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
} satisfies Config

export default config
