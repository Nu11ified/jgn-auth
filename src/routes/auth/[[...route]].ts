import { Hono } from 'hono';
import { getAuth } from '@/lib/auth';

// Create a Hono app for auth routes
const authApp = new Hono<{ Bindings: CloudflareBindings }>();

// Handle all auth routes
authApp.all('/*', async (c) => {
  const auth = getAuth(c.env.DB);
  
  try {
    // Convert Hono request to standard web request
    const request = c.req.raw;
    
    // Call Better Auth handler with the request
    const response = await auth.handler(request);
    
    // Return the response
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

export default authApp; 