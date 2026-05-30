import { Router } from 'express';
import {
  getAppliedLoans,
  getLoanDetails,
  approveLoan,
  rejectLoan,
} from '../controllers/sanction.controller';
import { protect } from '../middleware/auth.middleware';
import { allowRoles } from '../middleware/rbac.middleware';

const router = Router();

router.use(protect, allowRoles('sanction', 'admin'));

router.get('/loans', getAppliedLoans);             // GET  /api/sanction/loans
router.get('/loans/:id', getLoanDetails);          // GET  /api/sanction/loans/:id
router.put('/loans/:id/approve', approveLoan);     // PUT  /api/sanction/loans/:id/approve
router.put('/loans/:id/reject', rejectLoan);       // PUT  /api/sanction/loans/:id/reject

export default router;
