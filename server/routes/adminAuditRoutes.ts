import { Router } from 'express';
import { db } from '../db';
import { authLogs, users } from '@shared/schema';
import { desc, eq, sql } from 'drizzle-orm';

const router = Router();

// Middleware to restrict access to admin users only
router.use((req, res, next) => {
  if (!req.session?.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
});

// GET audit logs with pagination and filtering
router.get('/audit-log', async (req, res) => {
  try {
    const { limit = '50', page = '1', action, userId } = req.query;
    
    // Parse query params
    const limitNum = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Build query with filters
    let query = db.select({
      id: authLogs.id,
      userId: authLogs.userId,
      action: authLogs.action,
      status: authLogs.status,
      ipAddress: authLogs.ipAddress,
      userAgent: authLogs.userAgent,
      device: authLogs.device,
      details: authLogs.details,
      timestamp: authLogs.createdAt,
      username: users.username,
      email: users.email
    })
    .from(authLogs)
    .leftJoin(users, eq(authLogs.userId, users.id))
    .orderBy(desc(authLogs.createdAt))
    .limit(limitNum)
    .offset(offset);
    
    // Add filters if provided
    if (action) {
      query = query.where(eq(authLogs.action, action as string));
    }
    
    if (userId) {
      const userIdNum = parseInt(userId as string, 10);
      if (!isNaN(userIdNum)) {
        query = query.where(eq(authLogs.userId, userIdNum));
      }
    }
    
    const logs = await query;
    
    // Get total count for pagination
    const countResult = await db.select({ count: sql`count(*)` }).from(authLogs);
    const totalCount = Number(countResult[0]?.count) || 0;
    
    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
});

export default router;