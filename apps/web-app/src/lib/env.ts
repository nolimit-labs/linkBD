/**
 * Environment variable utility for frontend
 * Provides type-safe access to environment variables with validation
 */

interface EnvironmentConfig {
  appUrl: string;
}

/**
 * Get environment variable with validation
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Get all required environment variables
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    appUrl: getEnvVar('VITE_BASE_URL', 'http://localhost:3000'),
  };
}

/**
 * Individual environment variable getters
 */
export const env = {
  appUrl: import.meta.env.VITE_BASE_URL,
  isDevelopment: import.meta.env.DEV,
  isStaging: import.meta.env.VITE_NODE_ENV === 'staging',
  isProduction: import.meta.env.VITE_NODE_ENV === 'production',
};

/**
 * Validate all environment variables at startup
 */
export function validateEnvironment(): void {
  try {
    getEnvironmentConfig();
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    throw error;
  }
} 