
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Check for user preference and set initial theme
const setInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  // Use saved theme, prefer user system preference, or fallback to light
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.classList.add(initialTheme);
  localStorage.setItem('theme', initialTheme);
};

setInitialTheme();

createRoot(document.getElementById("root")!).render(<App />);
