import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { env } from './env.config';

// Ensure upload directory exists
const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const subDirs = ['products', 'bespoke', 'invoices'];
subDirs.forEach((dir) => {
  const subPath = path.join(uploadDir, dir);
  if (!fs.existsSync(subPath)) fs.mkdirSync(subPath, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const folder = req.uploadFolder || 'products';
    cb(null, path.join(uploadDir, folder));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE },
});

export const getFileUrl = (folder: string, filename: string): string =>
  `/uploads/${folder}/${filename}`;

export const deleteFile = (filePath: string): void => {
  const fullPath = path.resolve(filePath.replace(/^\//, ''));
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

// ── Phase 2 (Cloudinary — commented out) ────────────────────────
// import { v2 as cloudinary } from 'cloudinary';
// cloudinary.config({
//   cloud_name: env.CLOUDINARY_CLOUD_NAME,
//   api_key: env.CLOUDINARY_API_KEY,
//   api_secret: env.CLOUDINARY_API_SECRET,
// });
// export { cloudinary };
