import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { PDFProcessor } from '../services/pdfProcessor';

const router = express.Router();
const prisma = new PrismaClient();
const pdfProcessor = new PDFProcessor();

// Configure multer for file uploads
const upload = multer({
  dest: process.env.UPLOAD_DIR || './uploads',
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Upload resume
router.post('/', authenticate, upload.single('resume'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.userId!;

    // Extract text from PDF
    const extractionResult = await pdfProcessor.extractText(req.file.path);

    // Save resume to database
    const resume = await prisma.resume.create({
      data: {
        userId,
        filename: req.file.filename,
        originalFilename: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        extractedText: extractionResult.text,
        normalizedText: extractionResult.normalizedText,
        extractionQuality: extractionResult.extractionQuality,
      },
    });

    res.status(201).json(resume);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Get all resumes for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        originalFilename: true,
        fileSize: true,
        extractionQuality: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { analyses: true },
        },
      },
    });

    res.json(resumes);
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Get single resume
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json(resume);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// Delete resume
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Delete file
    try {
      await fs.unlink(resume.filePath);
    } catch (error) {
      console.error('File deletion error:', error);
    }

    // Delete from database (cascade will delete analyses)
    await prisma.resume.delete({
      where: { id },
    });

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

export default router;

