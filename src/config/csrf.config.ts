import { doubleCsrf } from 'csrf-csrf';

// Initialize doubleCsrf
const {
  doubleCsrfProtection,
  generateToken, // This is part of the returned object
} = doubleCsrf({
  getSecret: (req) => req.cookies['csrf-secret'], // Extract the CSRF secret from cookies
  cookieName: 'csrf-secret', // Name of the cookie to store the secret
  cookieOptions: {
    httpOnly: true, // Prevent client-side access
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict', // Mitigate CSRF attacks
  },
});

export { doubleCsrfProtection, generateToken };
