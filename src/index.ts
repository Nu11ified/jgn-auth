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
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  credentials: true,
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
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  const auth = getAuth(c.env.DB);
  return auth.handler(c.req.raw);
});

// Home route
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// User data route
app.get('/users', async (c) => {
  const db = createDb(c.env.DB)
  const result = await db.select().from(users).all()
  return c.json(result)
})

// Session check route
app.get('/session', (c) => {
  const user = c.get('user')
  
  return c.json({
    authenticated: !!user,
    ...(user && { user, session: c.get('session') })
  }, user ? 200 : 401);
});

export default app