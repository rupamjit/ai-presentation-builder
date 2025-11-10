import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../db/prisma";

// Validate required environment variables at module initialization
const validateEnvVars = () => {
  const requiredVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };

  const missing: string[] = [];
  
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please set them in your .env file or .env.local file.`
    );
  }

  return requiredVars as Record<string, string>;
};

const env = validateEnvVars();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Social providers configuration - GOOGLE ONLY
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
      accessType: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },

  // Security settings for production
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookieSameSite: "lax",
    generateId: () => crypto.randomUUID(),
    // Cross-subdomain cookies (if needed)
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: process.env.COOKIE_DOMAIN,
    },
  },

  // Trusted origins (prevent CORS issues)
  trustedOrigins: [
    env.BETTER_AUTH_URL,
    env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean),

  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute window
    max: 10, // Max 10 requests per window
  },

  // Account linking
  account: {
    accountLinking: {
      enabled: false, 
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
export type SessionData = typeof auth.$Infer.Session.session;