import { Router, Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import {
  submitPersonalDetails,
  uploadSalarySlip,
  applyForLoan,
  getLoanStatus,
  calculatePreview,
} from '../controllers/borrower.controller';
import { protect } from '../middleware/auth.middleware';
import { allowRoles } from '../middleware/rbac.middleware';

const router = Router();

// ── Multer Configuration ──────────────────────────────────────────────────────

// Ensure uploads directory exists at startup
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `salary-slip-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── Guards ────────────────────────────────────────────────────────────────────
// All borrower routes require a valid JWT + borrower role
router.use(protect, allowRoles('borrower'));

// ── Routes ────────────────────────────────────────────────────────────────────
router.post('/personal-details', submitPersonalDetails);

router.post(
  '/upload-slip',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('salarySlip')(req, res, (err: any) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ success: false, message: 'File too large. Maximum size is 5 MB.' });
        return;
      }
      if (err) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next();
    });
  },
  uploadSalarySlip
);

router.post('/apply', applyForLoan);
router.get('/status', getLoanStatus);
router.get('/calculate', calculatePreview);

export default router;