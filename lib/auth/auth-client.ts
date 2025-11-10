// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

// Validate required environment variables
const getBaseURL = (): string => {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!baseURL || typeof baseURL !== 'string' || baseURL.trim() === '') {
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_APP_URL. ' +
      'Please set it in your .env file to the full URL of your application (e.g., https://example.com or http://localhost:3000).'
    );
  }
  
  return baseURL;
};

// Create auth client with production configuration
export const authClient = createAuthClient({
  baseURL: getBaseURL()
});

// Export typed methods and hooks
export const { 
  signIn, 
  signUp, 
  signOut,
  useSession,
  updateUser,
  changePassword,
  resetPassword,
  getSession
} = authClient;
