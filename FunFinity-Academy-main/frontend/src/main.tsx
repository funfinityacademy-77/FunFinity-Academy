import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { checkSupabaseConnection } from "./lib/supabase";

// Check Supabase connection on app startup
checkSupabaseConnection(3, 1000).then((isConnected) => {
  if (!isConnected) {
    console.warn('⚠️ Supabase connection failed. Some features may not work correctly.');
    console.warn('Please verify your environment variables are set correctly in Vercel.');
  }
}).catch((error) => {
  console.error('Supabase connection check error:', error);
});

createRoot(document.getElementById("root")!).render(<App />);
