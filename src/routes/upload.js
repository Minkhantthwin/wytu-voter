const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../utils/prisma');
const { authMiddleware } = require('../utils/auth');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/candidates');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `candidate-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WEBP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB max
  },
});

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload candidate photo
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, WEBP, max 8MB)
 *               candidateId:
 *                 type: integer
 *                 description: Optional candidate ID to update
 *             required:
 *               - photo
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 photoUrl:
 *                   type: string
 *                 candidateId:
 *                   type: integer
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { candidateId } = req.body;

    // Build the URL path for the uploaded file
    const photoUrl = `/uploads/candidates/${req.file.filename}`;

    // If candidateId provided, update the candidate's photo
    if (candidateId) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: parseInt(candidateId) },
      });

      if (!candidate) {
        // Delete uploaded file if candidate not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'Candidate not found' });
      }

      // Delete old photo if exists
      if (candidate.photoUrl) {
        const oldPath = path.join(__dirname, '../../public', candidate.photoUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Update candidate with new photo URL
      await prisma.candidate.update({
        where: { id: parseInt(candidateId) },
        data: { photoUrl },
      });

      return res.json({
        success: true,
        message: 'Photo uploaded and candidate updated',
        url: photoUrl,
        photoUrl,
        candidateId: parseInt(candidateId),
      });
    }

    // Just return the uploaded file path
    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      url: photoUrl,
      photoUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Error handling for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 8MB limit' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
