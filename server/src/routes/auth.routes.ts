import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);       // POST /api/auth/register
router.post('/login', login);             // POST /api/auth/login
router.get('/me', protect, getMe);        // GET  /api/auth/me  (requires token)

export default router;