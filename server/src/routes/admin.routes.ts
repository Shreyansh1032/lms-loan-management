import { Router } from 'express';
import { getAllLoans, getAllUsers, getDashboardStats } from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { allowRoles } from '../middleware/rbac.middleware';

const router = Router();

router.use(protect, allowRoles('admin'));

router.get('/loans', getAllLoans);         // GET /api/admin/loans?status=applied
router.get('/users', getAllUsers);         // GET /api/admin/users
router.get('/stats', getDashboardStats);  // GET /api/admin/stats

export default router;