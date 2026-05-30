import { Router } from 'express';
import {
  getDisbursedLoans,
  getLoanWithPayments,
  recordPayment,
} from '../controllers/collection.controller';
import { protect } from '../middleware/auth.middleware';
import { allowRoles } from '../middleware/rbac.middleware';

const router = Router();

router.use(protect, allowRoles('collection', 'admin'));

router.get('/loans', getDisbursedLoans);              // GET  /api/collection/loans
router.get('/loans/:id', getLoanWithPayments);        // GET  /api/collection/loans/:id
router.post('/loans/:id/payment', recordPayment);     // POST /api/collection/loans/:id/payment

export default router;