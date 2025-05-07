import session from 'express-session';
import passport from 'passport';
import { Express } from 'express';
import authRoutes from './routes/authRoutes';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db';

// Use PostgreSQL session store for persistence
const PgSessionStore = connectPgSimple(session);

export const authMiddleware = session({
  store: new PgSessionStore({
    pool,
    tableName: 'sessions', // Should match the sessions table in schema.ts
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'paddock20_default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 86400000, // 1 day
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
});

export function setupAuth(app: Express) {
  // Apply session middleware
  app.use(authMiddleware);
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Passport session serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      // Look up the user in the database
      const { db } = await import('./db');
      const { users } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const [user] = await db.select().from(users).where(eq(users.id, id));
      
      if (!user) {
        return done(null, null);
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error, null);
    }
  });
  
  // Register authentication routes
  app.use('/api/auth', authRoutes);
}