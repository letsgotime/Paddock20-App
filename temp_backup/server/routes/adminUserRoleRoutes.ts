import { Router } from 'express';
import { db } from '../db';
import { z } from 'zod';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Middleware to protect with session and enforce admin role
router.use(async (req, res, next) => {
  if (!req.session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const [currentUser] = await db.select()
      .from(users)
      .where(eq(users.id, req.session.user.id));

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: 'Failed to verify admin privileges' });
  }
});

// PATCH role for a specific user
const roleSchema = z.object({
  role: z.enum(['user', 'admin'])
});

router.patch('/user/:id/role', async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id, 10);
  
  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    await db.update(users)
      .set({ role: parsed.data.role })
      .where(eq(users.id, userId));
    
    // Get the updated user to return
    const [updatedUser] = await db.select()
      .from(users)
      .where(eq(users.id, userId));
      
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive data
    const { password, ...safeUser } = updatedUser;
    
    res.status(200).json(safeUser);
  } catch (err) {
    console.error('Failed to update user role:', err);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

export default router;