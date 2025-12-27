import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { OpenAIService } from '../services/openaiService';

const router = express.Router();
const prisma = new PrismaClient();
const openaiService = new OpenAIService();

// Create analysis
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { resumeId, targetRole } = req.body;

    if (!resumeId) {
      return res.status(400).json({ error: 'resumeId is required' });
    }

    // Check if user has analyses remaining
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { analysesRemaining: true, subscriptionTier: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.analysesRemaining <= 0 && user.subscriptionTier === 'FREE') {
      return res.status(403).json({ error: 'No analyses remaining. Please upgrade your plan.' });
    }

    // Get resume
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (!resume.normalizedText) {
      return res.status(400).json({ error: 'Resume text not extracted' });
    }

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        resumeId,
        userId,
        targetRole: targetRole || null,
        status: 'PROCESSING',
      },
    });

    // Process analysis asynchronously
    processAnalysis(analysis.id, resume.normalizedText, targetRole, userId);

    res.status(201).json(analysis);
  } catch (error) {
    console.error('Create analysis error:', error);
    res.status(500).json({ error: 'Failed to create analysis' });
  }
});

// Process analysis (async)
async function processAnalysis(
  analysisId: string,
  resumeText: string,
  targetRole: string | undefined,
  userId: string
) {
  const startTime = Date.now();

  try {
    // Call OpenAI service
    const report = await openaiService.analyzeResume({
      resumeText,
      targetRole,
    });

    // Calculate metrics
    const metrics = {
      quantificationRate: report.metrics?.quantificationRate || 0,
      clarityScore: report.metrics?.clarityScore || 0,
      impactDistribution: report.metrics?.impactDistribution || {},
    };

    // Update analysis
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: 'COMPLETED',
        report: report as any,
        metrics: metrics as any,
        completedAt: new Date(),
        processingTimeMs: Date.now() - startTime,
      },
    });

    // Decrement user's analyses remaining
    await prisma.user.update({
      where: { id: userId },
      data: {
        analysesRemaining: {
          decrement: 1,
        },
      },
    });
  } catch (error) {
    console.error('Analysis processing error:', error);
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
        processingTimeMs: Date.now() - startTime,
      },
    });
  }
}

// Get all analyses for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const analyses = await prisma.analysis.findMany({
      where: { userId },
      include: {
        resume: {
          select: {
            id: true,
            originalFilename: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(analyses);
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// Get single analysis
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const analysis = await prisma.analysis.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        resume: {
          select: {
            id: true,
            originalFilename: true,
            extractionQuality: true,
          },
        },
      },
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// Delete analysis
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const analysis = await prisma.analysis.findFirst({
      where: { id, userId },
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    await prisma.analysis.delete({
      where: { id },
    });

    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

export default router;

