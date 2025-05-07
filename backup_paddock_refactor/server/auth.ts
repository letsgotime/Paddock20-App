import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import passport from 'passport';
import { Express } from 'express';
import authRoutes from './routes/authRoutes';

const pgSession = connectPgSimple(session);

export const authMiddleware = session({
  store: new pgSession({
    pool: new pg.Pool({ connectionString: process.env.DATABASE_URL }),
    tableName: 'session'
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
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      // This should be replaced with a database lookup in production
      done(null, { id });
    } catch (error) {
      done(error, null);
    }
  });
  
  // Register authentication routes
  app.use('/api/auth', authRoutes);
}