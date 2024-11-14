/* eslint-disable no-console */

const checkEnvVars = (): boolean => {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'DATABASE',
    'AUTH_URL',
    'TRAKT_API_URL',
    'TRAKT_CLIENT_ID',
    'TRAKT_CLIENT_SECRET',
    'RATELIMIT_MAXCONNECTIONS',
    'RATELIMIT_WINDOWMS',
    'CORS_WHITELIST'
  ];

  const missingEnvVars: string[] = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  });

  if (missingEnvVars.length > 0) {
    console.error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    return true;
  } else {
    return false;
  }
};

export default checkEnvVars;
