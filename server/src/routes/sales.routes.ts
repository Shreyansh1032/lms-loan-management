import { Router } from 'express';
import { getLeads } from '../controllers/sales.controller';
import { protect } from '../middleware/auth.middleware';
import { allowRoles } from '../middleware/rbac.middleware';

const router = Router();

router.use(protect, allowRoles('sales', 'admin'));

router.get('/leads', getLeads);   // GET /api/sales/leads

export default router;