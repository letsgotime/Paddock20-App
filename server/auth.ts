import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { db } from "./db";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);
const PostgresSessionStore = connectPg(session);

// Password hashing and verification
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Create session store
  const sessionStore = new PostgresSessionStore({
    conObject: {
      connectionString: process.env.DATABASE_URL,
    },
    tableName: 'sessions',
    createTableIfMissing: true
  });

  // Session middleware setup
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'paddock20-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      httpOnly: true,
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure LocalStrategy for username/password auth
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // Using email as the username field
        passwordField: 'password'
      }, 
      async (email, password, done) => {
        try {
          // Get user by email
          const user = await storage.getUserByEmail(email);
          
          // No user or password doesn't match
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
          }
          
          // Update last login time
          await storage.updateLastLogin(user.id);
          
          // Log the successful login
          await storage.createAuthLog({
            userId: user.id,
            action: 'login',
            status: 'success',
            ipAddress: '', // Will be filled by route handler
            userAgent: '', // Will be filled by route handler
            details: {}
          });
          
          return done(null, user);
        } catch (error) {
          console.error("Authentication error:", error);
          return done(error);
        }
      }
    )
  );

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register a new user
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(req.body.password);

      // Create the user
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // Strip sensitive information
      const safeUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      };

      // Log the successful registration
      await storage.createAuthLog({
        userId: user.id,
        action: 'register',
        status: 'success',
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
        details: {}
      });

      // Log the user in automatically
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(safeUser);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login user
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      
      if (!user) {
        // Log failed login attempt
        storage.createAuthLog({
          userId: null, // No user found
          action: 'login',
          status: 'failed',
          ipAddress: req.ip || '',
          userAgent: req.headers['user-agent'] || '',
          details: { message: info?.message || "Authentication failed" }
        }).catch(error => console.error("Error logging failed login:", error));
        
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Strip sensitive information
        const safeUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        };
        
        // Update auth log with IP and user agent
        storage.updateAuthLogForUser(user.id, {
          ipAddress: req.ip || '',
          userAgent: req.headers['user-agent'] || '',
        }).catch(error => console.error("Error updating auth log:", error));
        
        res.status(200).json(safeUser);
      });
    })(req, res, next);
  });

  // Logout user
  app.post("/api/logout", async (req, res, next) => {
    if (req.isAuthenticated()) {
      const userId = (req.user as User).id;
      
      // Log the logout
      await storage.createAuthLog({
        userId,
        action: 'logout',
        status: 'success',
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
        details: {}
      });
    }
    
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = req.user as User;
    
    // Strip sensitive information
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    };
    
    res.json(safeUser);
  });

  // Password reset request
  app.post("/api/reset-password/request", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal that the email doesn't exist
        return res.status(200).json({ message: "If your email is registered, you will receive a reset link shortly" });
      }
      
      // Generate token
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour
      
      // Store token in database
      await storage.updateResetToken(user.id, token, expiresAt);
      
      // In a real app, we would send an email with the reset link
      // For now, we just return a message with the token for testing
      console.log(`Reset token for ${email}: ${token}`);
      
      res.status(200).json({ message: "If your email is registered, you will receive a reset link shortly" });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  // Password reset (with token)
  app.post("/api/reset-password/confirm", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Missing token or new password" });
      }
      
      // Find user by reset token
      const user = await storage.getUserByResetToken(token);
      
      if (!user || !user.resetTokenExpires || new Date() > user.resetTokenExpires) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password and clear reset token
      await storage.updatePasswordAndClearResetToken(user.id, hashedPassword);
      
      // Log the password reset
      await storage.createAuthLog({
        userId: user.id,
        action: 'password_reset',
        status: 'success',
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
        details: {}
      });
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Update password (when logged in)
  app.post("/api/password/update", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user as User;
      
      // Verify current password
      if (!(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await storage.updatePassword(user.id, hashedPassword);
      
      // Log the password change
      await storage.createAuthLog({
        userId: user.id,
        action: 'password_change',
        status: 'success',
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
        details: {}
      });
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ error: "Failed to update password" });
    }
  });

  // Update user profile
  app.post("/api/profile/update", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const user = req.user as User;
      const updatedFields = req.body;
      
      // Don't allow updating sensitive fields
      delete updatedFields.password;
      delete updatedFields.email; // Email updates should have their own verification flow
      delete updatedFields.role;
      delete updatedFields.createdAt;
      delete updatedFields.updatedAt;
      
      // Update user profile
      const updatedUser = await storage.updateUserProfile(user.id, updatedFields);
      
      // Strip sensitive information
      const safeUser = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        createdAt: updatedUser.createdAt,
      };
      
      res.status(200).json(safeUser);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Middleware for requiring authentication
  app.use("/api/protected", (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Authentication required" });
  });
}