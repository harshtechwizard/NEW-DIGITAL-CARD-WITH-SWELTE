import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
	let theme = $state<Theme>('light');

	// Initialize theme from localStorage or system preference
	if (browser) {
		const stored = localStorage.getItem('theme') as Theme | null;
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const initialTheme = stored || (prefersDark ? 'dark' : 'light');
		theme = initialTheme;
		
		// Apply theme to document
		if (initialTheme === 'dark') {
			document.documentElement.classList.add('dark');
		}
	}

	return {
		get current() {
			return theme;
		},
		toggle() {
			theme = theme === 'light' ? 'dark' : 'light';
			
			if (browser) {
				localStorage.setItem('theme', theme);
				document.documentElement.classList.toggle('dark', theme === 'dark');
			}
		},
		set(newTheme: Theme) {
			theme = newTheme;
			
			if (browser) {
				localStorage.setItem('theme', theme);
				document.documentElement.classList.toggle('dark', theme === 'dark');
			}
		}
	};
}

export const themeStore = createThemeStore();
