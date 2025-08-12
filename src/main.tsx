
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './integrations/supabase/client';
import { Auth0Provider } from '@auth0/auth0-react';

// Check for storage buckets and create if necessary
const checkAndCreateStorageBuckets = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error checking storage buckets:", error);
      return;
    }
    
    // Log the existing buckets
    console.log("Available storage buckets:", buckets);
    
    // No need to create buckets here as they are now handled via SQL migrations
  } catch (err) {
    console.error("Error in storage bucket check:", err);
  }
};

// Check for user preference and set initial theme
const setInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  // Use saved theme, prefer user system preference, or fallback to light
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.classList.add(initialTheme);
  localStorage.setItem('theme', initialTheme);
};

// Initialize app
const initializeApp = async () => {
  setInitialTheme();
  await checkAndCreateStorageBuckets();
  
  createRoot(document.getElementById("root")!).render(
    <Auth0Provider
      domain="dev-d2ann4rwjubpdlkv.us.auth0.com"
      clientId="mlGxTY663Smds3EJcF5dN4fJIikS8la4"
      authorizationParams={{ redirect_uri: window.location.origin }}
      cacheLocation="localstorage"
    >
      <App />
    </Auth0Provider>
  );
};

initializeApp();
