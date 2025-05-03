import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, type User, type InsertUser, type InsertAuthLog, type InsertSession } from "@shared/schema";
import { storage } from "./storage";

// Extend Express.User with our User type
declare global {
  namespace Express {
    // Define our User interface for Express
    interface User extends User {}
  }
}

// Create promisified version of scrypt
const scryptAsync = promisify(scrypt);

// Password hashing functions
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Using storage.sessionStore now instead of creating a new instance here

// Authentication setup function
export function setupAuth(app: Express) {
  // Session configuration
  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET || "paddock20-secure-session-secret";
  
  const sessionConfig: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: isProduction, // Set to true in production 
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax"
    }
  };
  
  // Enable trust proxy in production
  if (isProduction) {
    app.set("trust proxy", 1);
  }
  
  // Setup session middleware
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Local strategy configuration
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Find user by username
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username));
        
        // User not found or password doesn't match
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Update last login time
        await db
          .update(users)
          .set({ lastLogin: new Date() })
          .where(eq(users.id, user.id));
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id));
        
      // User not found
      if (!user) {
        return done(null, false);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });
  
  // Authentication routes
  
  // Register new user
  app.post("/api/register", async (req, res) => {
    try {
      // Check if username already exists
      const existingUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, req.body.username));
      
      if (existingUsername.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Username already exists" 
        });
      }
      
      // Check if email already exists
      const existingEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, req.body.email));
      
      if (existingEmail.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Email already exists" 
        });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Remove confirmPassword before inserting
      const { confirmPassword, ...userData } = req.body;
      
      // Insert user into database
      const [newUser] = await db
        .insert(users)
        .values({
          ...userData,
          password: hashedPassword,
          lastLogin: new Date(),
          // Generate verification token
          verificationToken: randomBytes(32).toString("hex"),
        })
        .returning();
      
      // Login the user (auto-login after registration)
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            error: "Error logging in after registration" 
          });
        }
        
        // Send verification email (to be implemented)
        // sendVerificationEmail(newUser.email, newUser.verificationToken);
        
        // Return user data (exclude sensitive information)
        const { password, resetToken, verificationToken, ...safeUserData } = newUser;
        return res.status(201).json({ 
          success: true, 
          user: safeUserData
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Registration failed. Please try again." 
      });
    }
  });
  
  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: info?.message || "Invalid username or password" 
        });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Return user data (exclude sensitive information)
        const { password, resetToken, verificationToken, ...safeUserData } = user;
        return res.json({ 
          success: true, 
          user: safeUserData 
        });
      });
    })(req, res, next);
  });
  
  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          error: "Error logging out" 
        });
      }
      res.json({ 
        success: true, 
        message: "Logged out successfully" 
      });
    });
  });
  
  // Get authenticated user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        error: "Not authenticated" 
      });
    }
    
    // Return user data (exclude sensitive information)
    const { password, resetToken, verificationToken, ...safeUserData } = req.user;
    res.json({ 
      success: true, 
      user: safeUserData 
    });
  });
  
  // Update user profile
  app.put("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        error: "Not authenticated" 
      });
    }
    
    try {
      // Update user in database
      const [updatedUser] = await db
        .update(users)
        .set({
          ...req.body,
          updatedAt: new Date()
        })
        .where(eq(users.id, req.user.id))
        .returning();
      
      // Return updated user data (exclude sensitive information)
      const { password, resetToken, verificationToken, ...safeUserData } = updatedUser;
      res.json({ 
        success: true, 
        user: safeUserData 
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Profile update failed. Please try again." 
      });
    }
  });
  
  // Email verification
  app.get("/api/verify-email/:token", async (req, res) => {
    try {
      const token = req.params.token;
      
      // Find user with matching verification token
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.verificationToken, token));
      
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid verification token" 
        });
      }
      
      // Update user as verified
      await db
        .update(users)
        .set({
          isEmailVerified: true,
          verificationToken: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      // Redirect to frontend verification success page
      res.redirect("/email-verified");
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Email verification failed. Please try again." 
      });
    }
  });
  
  // Password reset request
  app.post("/api/reset-password-request", async (req, res) => {
    try {
      const { email } = req.body;
      
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      
      // Don't reveal if user exists or not
      if (!user) {
        return res.json({ 
          success: true, 
          message: "If your email is registered, you will receive a password reset link." 
        });
      }
      
      // Generate reset token and expiry (1 hour from now)
      const resetToken = randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
      
      // Update user with reset token
      await db
        .update(users)
        .set({
          resetToken,
          resetTokenExpires,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      // Send password reset email (to be implemented)
      // sendPasswordResetEmail(user.email, resetToken);
      
      res.json({ 
        success: true, 
        message: "If your email is registered, you will receive a password reset link." 
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Password reset request failed. Please try again." 
      });
    }
  });
  
  // Password reset
  app.post("/api/reset-password/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
      // Find user with matching reset token that hasn't expired
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.resetToken, token));
      
      if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid or expired reset token" 
        });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(password);
      
      // Update user with new password
      await db
        .update(users)
        .set({
          password: hashedPassword,
          resetToken: null,
          resetTokenExpires: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      res.json({ 
        success: true, 
        message: "Password reset successful. Please login with your new password." 
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Password reset failed. Please try again." 
      });
    }
  });
  
  // Change password (authenticated)
  app.post("/api/change-password", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        error: "Not authenticated" 
      });
    }
    
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Check if current password is correct
      if (!(await comparePasswords(currentPassword, req.user.password))) {
        return res.status(400).json({ 
          success: false, 
          error: "Current password is incorrect" 
        });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user with new password
      await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, req.user.id));
      
      res.json({ 
        success: true, 
        message: "Password changed successfully" 
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Password change failed. Please try again." 
      });
    }
  });
  
  // Complete onboarding flag
  app.post("/api/complete-onboarding", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        error: "Not authenticated" 
      });
    }
    
    try {
      // Update user as onboarded
      const [updatedUser] = await db
        .update(users)
        .set({
          onboardingCompleted: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, req.user.id))
        .returning();
      
      // Return updated user data (exclude sensitive information)
      const { password, resetToken, verificationToken, ...safeUserData } = updatedUser;
      res.json({ 
        success: true, 
        user: safeUserData 
      });
    } catch (error) {
      console.error("Complete onboarding error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Completing onboarding failed. Please try again." 
      });
    }
  });
}