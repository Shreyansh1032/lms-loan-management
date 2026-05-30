import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { UserRole } from '../models/User';

/**
 * Factory that returns middleware allowing only specified roles.
 * Usage: router.use(protect, allowRoles('admin', 'sanction'))
 */
export const allowRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. This resource requires one of: [${roles.join(', ')}]. Your role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};