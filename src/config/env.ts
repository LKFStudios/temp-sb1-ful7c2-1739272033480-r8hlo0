interface Env {
  GEMINI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_JWT_SECRET: string;
  MIXPANEL_TOKEN: string;
  IS_DEV: boolean;
}

function validateEnv(): void {
  const requiredVars = [
    'VITE_GEMINI_API_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_JWT_SECRET',
    'VITE_MIXPANEL_TOKEN'
  ];

  const missing = requiredVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
}

validateEnv();

export const env: Env = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_JWT_SECRET: import.meta.env.VITE_SUPABASE_JWT_SECRET || '',
  MIXPANEL_TOKEN: import.meta.env.VITE_MIXPANEL_TOKEN || '',
  IS_DEV: import.meta.env.DEV
} as const;