import { Router } from 'express';
import { db } from '../db';
import { users, authLogs } from '@shared/schema';
import { eq, desc, sql, and, or, like } from 'drizzle-orm';

const router = Router();

// Middleware to restrict access to admin users only
router.use((req, res, next) => {
  if (!req.session?.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
});

// GET all users with pagination and search
router.get('/users', async (req, res) => {
  try {
    const { 
      limit = '10', 
      page = '1', 
      search = '',
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;
    
    // Parse query params
    const limitNum = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Build base query
    let query = db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      isEmailVerified: users.isEmailVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImage: users.profileImage
    })
    .from(users);
    
    // Add search filter if provided
    if (search) {
      query = query.where(
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`)
        )
      );
    }
    
    // Add role filter if provided
    if (role) {
      query = query.where(eq(users.role, role as string));
    }
    
    // Add sorting
    if (sortBy === 'username') {
      query = query.orderBy(sortOrder === 'asc' ? users.username : desc(users.username));
    } else if (sortBy === 'email') {
      query = query.orderBy(sortOrder === 'asc' ? users.email : desc(users.email));
    } else if (sortBy === 'role') {
      query = query.orderBy(sortOrder === 'asc' ? users.role : desc(users.role));
    } else {
      // Default to created date
      query = query.orderBy(sortOrder === 'asc' ? users.createdAt : desc(users.createdAt));
    }
    
    // Add pagination
    query = query.limit(limitNum).offset(offset);
    
    const usersList = await query;
    
    // Get total count for pagination
    const countResult = await db.select({ count: sql`count(*)` }).from(users);
    const totalCount = Number(countResult[0]?.count) || 0;
    
    res.status(200).json({
      success: true,
      users: usersList,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// GET a single user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Failed to fetch user:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// PATCH update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be "admin" or "user"' });
    }
    
    // Check if user exists
    const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prevent changing own role to prevent locking yourself out
    if (req.session.user.id === userId && existingUser.role === 'admin' && role === 'user') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot downgrade your own admin privileges' 
      });
    }
    
    // Update the user role
    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    
    // Create an audit log entry
    await db.insert(authLogs).values({
      userId: req.session.user.id,
      action: 'CHANGE_ROLE',
      status: 'SUCCESS',
      details: JSON.stringify({
        targetUserId: userId,
        oldRole: existingUser.role,
        newRole: role
      }),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown',
      device: 'web',
      createdAt: new Date()
    });
    
    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Failed to update user role:', err);
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
});

// PATCH update user onboarding status
router.patch('/users/:id/onboarding', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { onboardingCompleted } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    if (typeof onboardingCompleted !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid onboardingCompleted status. Must be a boolean' 
      });
    }
    
    // Check if user exists
    const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update the user onboarding status
    const [updatedUser] = await db
      .update(users)
      .set({ onboardingCompleted, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    
    // Create an audit log entry
    await db.insert(authLogs).values({
      userId: req.session.user.id,
      action: 'UPDATE_ONBOARDING_STATUS',
      status: 'SUCCESS',
      details: JSON.stringify({
        targetUserId: userId,
        oldStatus: existingUser.isEmailVerified,
        newStatus: onboardingCompleted
      }),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown',
      device: 'web',
      createdAt: new Date()
    });
    
    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Failed to update user onboarding status:', err);
    res.status(500).json({ success: false, message: 'Failed to update user onboarding status' });
  }
});

// GET dashboard analytics
router.get('/analytics', async (req, res) => {
  try {
    // Total users count
    const [totalUsersResult] = await db.select({ count: sql`count(*)` }).from(users);
    const totalUsers = Number(totalUsersResult?.count) || 0;
    
    // Active users (users who have completed onboarding)
    const [activeUsersResult] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.onboardingCompleted, true));
    const activeUsers = Number(activeUsersResult?.count) || 0;
    
    // Admin users count
    const [adminUsersResult] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.role, 'admin'));
    const adminUsers = Number(adminUsersResult?.count) || 0;
    
    // New users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [newUsersResult] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${thirtyDaysAgo}`);
    const newUsers = Number(newUsersResult?.count) || 0;
    
    // Get onboarding completion rate
    const onboardingRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
    
    // Recent users
    const recentUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5);
    
    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        adminUsers,
        newUsers,
        onboardingRate,
        recentUsers
      }
    });
  } catch (err) {
    console.error('Failed to fetch analytics:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

export default router;