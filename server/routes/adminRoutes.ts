import { Router } from 'express';
import { db } from '../db';
import { users, authLogs } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Middleware to restrict access to admin users only
router.use((req, res, next) => {
  if (!req.session?.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
});

// GET all users
router.get('/users', async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    // Remove sensitive data
    const safeUsers = allUsers.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    res.status(200).json({ success: true, users: safeUsers });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// GET a specific user
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Remove sensitive data
    const { password, ...safeUser } = user;
    
    return res.status(200).json({ success: true, user: safeUser });
  } catch (err) {
    console.error(`Failed to fetch user ${req.params.id}:`, err);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// PATCH update a user's role
const roleSchema = z.object({
  role: z.enum(['user', 'admin', 'editor'])
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    const validation = roleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role value',
        errors: validation.error.errors
      });
    }
    
    const { role } = validation.data;
    
    await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
    
    return res.status(200).json({ 
      success: true, 
      message: `User role updated to ${role}`
    });
  } catch (err) {
    console.error(`Failed to update role for user ${req.params.id}:`, err);
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
});

// PATCH update a user's status (active/inactive)
const statusSchema = z.object({
  onboarding_complete: z.boolean().optional(),
  isActive: z.boolean().optional()
});

router.patch('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    const validation = statusSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input',
        errors: validation.error.errors
      });
    }
    
    await db.update(users)
      .set({ 
        ...validation.data,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
    
    // Fetch and return the updated user
    const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));
    const { password, ...safeUser } = updatedUser;
    
    return res.status(200).json({ 
      success: true, 
      message: 'User updated successfully',
      user: safeUser
    });
  } catch (err) {
    console.error(`Failed to update user ${req.params.id}:`, err);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// GET user statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total user count
    const totalUsersResult = await db.select({ count: users.id }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;
    
    // Get active user count (where isActive === true)
    const activeUsersResult = await db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.isActive, true));
    const activeUsers = activeUsersResult[0]?.count || 0;
    
    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersTodayResult = await db
      .select({ count: users.id })
      .from(users)
      .where(users.createdAt >= today);
    const newUsersToday = newUsersTodayResult[0]?.count || 0;
    
    // Get onboarding completion stats
    const onboardedUsersResult = await db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.onboardingCompleted, true));
    const onboardedUsers = onboardedUsersResult[0]?.count || 0;
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        newUsersToday,
        onboardingCompletedPercentage: totalUsers > 0 
          ? Math.round((onboardedUsers / totalUsers) * 100) 
          : 0,
        premiumUsers: 0, // Placeholder - implement premium user detection as needed
        suspendedUsers: totalUsers - activeUsers
      }
    });
  } catch (err) {
    console.error('Failed to fetch stats:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user statistics' });
  }
});

// GET login activity
router.get('/activity', async (req, res) => {
  try {
    const activity = await db
      .select({
        id: authLogs.id,
        userId: authLogs.userId,
        action: authLogs.action,
        status: authLogs.status,
        ipAddress: authLogs.ipAddress,
        userAgent: authLogs.userAgent,
        device: authLogs.device,
        timestamp: authLogs.createdAt,
        username: users.username
      })
      .from(authLogs)
      .leftJoin(users, eq(authLogs.userId, users.id))
      .orderBy(desc(authLogs.createdAt))
      .limit(100);
    
    res.status(200).json({ success: true, activity });
  } catch (err) {
    console.error('Failed to fetch login activity:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch login activity' });
  }
});

export default router;