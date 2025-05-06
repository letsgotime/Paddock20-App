// Simple test script to verify .env loading
import 'dotenv/config';

console.log('Environment variables test:');
console.log('--------------------------');
console.log('AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);
console.log('AUTH0_AUDIENCE:', process.env.AUTH0_AUDIENCE);
console.log('AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID);
console.log('AUTH0_CLIENT_SECRET:', process.env.AUTH0_CLIENT_SECRET ? 'Set (not showing value)' : 'Not Set');
console.log('--------------------------');