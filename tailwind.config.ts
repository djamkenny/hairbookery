
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				salon: {
					50: '#f9f7f5',
					100: '#f1eee9',
					200: '#e2dcd4',
					300: '#d3c7bd',
					400: '#bba99a',
					500: '#a99480',
					600: '#9a816d',
					700: '#86705e',
					800: '#6e5c4f',
					900: '#5a4c43',
					950: '#2c2620',
				},
				web3: {
					purple: '#8B5CF6',
					blue: '#3B82F6',
					cyan: '#06B6D4',
					pink: '#EC4899',
					indigo: '#6366F1',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-web3': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 25%, #06B6D4 50%, #EC4899 75%, #6366F1 100%)',
				'gradient-web3-subtle': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.15) 25%, rgba(6, 182, 212, 0.1) 50%, rgba(236, 72, 153, 0.12) 75%, rgba(99, 102, 241, 0.08) 100%)',
				'gradient-dark-premium': 'linear-gradient(135deg, hsl(240, 10%, 3.9%) 0%, hsl(240, 12%, 5%) 25%, hsl(260, 15%, 4%) 50%, hsl(240, 10%, 3.9%) 75%, hsl(235, 8%, 4.5%) 100%)',
				'gradient-card-premium': 'linear-gradient(135deg, hsla(240, 10%, 5.9%, 0.9) 0%, hsla(263, 70%, 8%, 0.8) 25%, hsla(270, 50%, 6%, 0.9) 50%, hsla(260, 60%, 7%, 0.85) 75%, hsla(240, 10%, 5.9%, 0.9) 100%)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'web3': '0 4px 20px rgba(139, 92, 246, 0.15), 0 0 40px rgba(59, 130, 246, 0.1)',
				'web3-lg': '0 8px 40px rgba(139, 92, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.15), 0 0 80px rgba(6, 182, 212, 0.1)',
				'premium': '0 4px 20px hsla(263, 70%, 65%, 0.15), 0 0 40px hsla(270, 50%, 50%, 0.1)',
				'premium-lg': '0 8px 40px hsla(263, 70%, 65%, 0.2), 0 0 60px hsla(270, 50%, 50%, 0.15), 0 0 80px hsla(280, 60%, 45%, 0.1)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'slide-in': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'glow-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsla(263, 70%, 65%, 0.2), 0 0 40px hsla(270, 50%, 50%, 0.1)' 
					},
					'50%': { 
						boxShadow: '0 0 30px hsla(263, 70%, 65%, 0.3), 0 0 60px hsla(270, 50%, 50%, 0.2)' 
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.3s ease-out',
				'accordion-up': 'accordion-up 0.3s ease-out',
				'fade-in': 'fade-in 0.4s ease-out',
				'fade-out': 'fade-out 0.4s ease-out',
				'slide-in': 'slide-in 0.6s ease-out',
				'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in': 'scale-in 0.2s ease-out',
				'enter': 'fade-in 0.4s ease-out, scale-in 0.3s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
