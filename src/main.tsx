
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './integrations/supabase/client';

// Check for storage buckets and create if necessary
const checkAndCreateStorageBuckets = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error checking storage buckets:", error);
      return;
    }
    
    // Check if stylist-images bucket exists
    const stylistImagesBucket = buckets?.find(bucket => bucket.name === 'stylist-images');
    
    if (!stylistImagesBucket) {
      // Create stylist-images bucket
      const { error: createError } = await supabase.storage.createBucket('stylist-images', {
        public: true
      });
      
      if (createError) {
        console.error("Error creating stylist-images bucket:", createError);
      } else {
        console.log("Created stylist-images bucket");
      }
    }
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
  
  createRoot(document.getElementById("root")!).render(<App />);
};

initializeApp();
