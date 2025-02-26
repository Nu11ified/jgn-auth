import { Hono } from 'hono'
import { createDb } from '@/db'
import { users } from '@/db/schema'
import { cors } from 'hono/cors'
import { getAuth } from '@/lib/auth'

// Define app with correct typing
const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    user: any | null;
    session: any | null;
  }
}>()

// Configure CORS middleware once
app.use('/api/*', cors({
  origin: '*', // Replace with specific origins in production
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 86400, // 24 hours
  exposeHeaders: ['Content-Length', 'Content-Type']
}))

// Auth middleware to set user and session in context
app.use('*', async (c, next) => {
  const auth = getAuth(c.env.DB);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  c.set('user', session?.user || null);
  c.set('session', session?.session || null);
  return next();
});

// Better Auth handler
app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  try {
    console.log('Auth request path:', c.req.path);
    console.log('Auth request method:', c.req.method);
    
    const auth = getAuth(c.env.DB);
    const response = await auth.handler(c.req.raw);
    
    console.log('Auth response status:', response.status);
    
    // For non-OK responses, log more details
    if (!response.ok) {
      const clonedResponse = response.clone();
      try {
        const body = await clonedResponse.text();
        console.error('Auth error response body:', body);
      } catch (e) {
        console.error('Failed to read auth error response', e);
      }
    }
    
    return response;
  } catch (error) {
    console.error('Auth handler error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error in auth handler' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Home route
app.get('/', (c) => {
  // Redirect to profile if authenticated, otherwise show login page
  const user = c.get('user');
  if (user) {
    return Response.redirect(`${new URL(c.req.url).origin}/profile.html`, 302);
  }
  return c.env.ASSETS.fetch(c.req.raw);
})

// Session check route
app.get('/session', (c) => {
  const user = c.get('user')
  
  return c.json({
    authenticated: !!user,
    ...(user && { user, session: c.get('session') })
  }, user ? 200 : 401);
});

// User data route
app.get('/users', async (c) => {
  const db = createDb(c.env.DB)
  const result = await db.select().from(users).all()
  return c.json(result)
})

// Serve static assets for all other routes
app.get('*', async (c) => {
  // Try to serve the asset
  const response = await c.env.ASSETS.fetch(c.req.raw);
  
  // If the asset is not found, serve the index.html page
  if (response.status === 404) {
    return c.env.ASSETS.fetch(new Request(`${new URL(c.req.url).origin}/index.html`));
  }
  
  return response;
});

export default app