
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
		fontFamily: {
			'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
			'display': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
		},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				// Mobile-first responsive sizes
				'mobile-xs': ['0.7rem', { lineHeight: '1rem' }],
				'mobile-sm': ['0.8rem', { lineHeight: '1.2rem' }],
				'mobile-base': ['0.9rem', { lineHeight: '1.4rem' }],
				'mobile-lg': ['1rem', { lineHeight: '1.5rem' }],
				'mobile-xl': ['1.1rem', { lineHeight: '1.6rem' }],
				'mobile-2xl': ['1.3rem', { lineHeight: '1.8rem' }],
				'mobile-3xl': ['1.6rem', { lineHeight: '2rem' }],
				'mobile-4xl': ['2rem', { lineHeight: '2.2rem' }],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
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
					foreground: 'hsl(var(--accent-foreground))',
					gold: 'hsl(var(--accent-gold))',
					purple: 'hsl(var(--accent-purple))'
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
				'gradient-professional': 'linear-gradient(135deg, hsl(205, 80%, 60%) 0%, hsl(205, 85%, 70%) 100%)',
				'gradient-neutral': 'linear-gradient(180deg, hsl(205, 85%, 98%) 0%, hsl(0, 0%, 100%) 100%)',
				'gradient-card': 'linear-gradient(135deg, hsl(0, 0%, 100%) 0%, hsl(205, 85%, 98%) 100%)',
			},
		borderRadius: {
			lg: '1rem',
			md: '0.75rem',
			sm: '0.5rem',
			xl: '1.25rem',
			'2xl': '1.5rem'
		},
			boxShadow: {
				'professional': '0 4px 20px -4px rgba(100, 181, 246, 0.15)',
				'professional-lg': '0 8px 32px -8px rgba(100, 181, 246, 0.20)',
				'elevated': '0 2px 12px rgba(100, 181, 246, 0.10)',
				'elevated-lg': '0 4px 24px rgba(100, 181, 246, 0.15)',
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
				'subtle-pulse': {
					'0%, 100%': { 
						boxShadow: '0 2px 12px hsla(205, 80%, 60%, 0.10)' 
					},
					'50%': { 
						boxShadow: '0 4px 20px hsla(205, 85%, 70%, 0.15)' 
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.3s ease-out',
				'accordion-up': 'accordion-up 0.3s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'fade-out': 'fade-out 0.4s ease-out',
				'slide-in': 'slide-in 0.6s ease-out',
				'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in': 'scale-in 0.5s ease-out',
				'enter': 'fade-in 0.4s ease-out, scale-in 0.3s ease-out',
				'subtle-pulse': 'subtle-pulse 3s ease-in-out infinite',
				'shimmer': 'shimmer 3s linear infinite',
				'float': 'float 3s ease-in-out infinite',
				'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
