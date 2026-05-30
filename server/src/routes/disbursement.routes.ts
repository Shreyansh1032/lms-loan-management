import { Router } from 'express';
import {
  getSanctionedLoans,
  getLoanDetails,
  disburseLoan,
} from '../controllers/disbursement.controller';
import { protect } from '../middleware/auth.middleware';
import { allowRoles } from '../middleware/rbac.middleware';

const router = Router();

router.use(protect, allowRoles('disbursement', 'admin'));

router.get('/loans', getSanctionedLoans);          // GET /api/disbursement/loans
router.get('/loans/:id', getLoanDetails);          // GET /api/disbursement/loans/:id
router.put('/loans/:id/disburse', disburseLoan);   // PUT /api/disbursement/loans/:id/disburse

export default router;