const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');

// Helper to get client IP address
const getClientIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

// Helper to get or create cookie ID
const getCookieId = (req, res) => {
  let cookieId = req.cookies.voter_id;
  if (!cookieId) {
    cookieId = uuidv4();
    res.cookie('voter_id', cookieId, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: true,
      sameSite: 'lax', // Changed from 'strict' to 'lax' for cross-origin compatibility
      secure: process.env.NODE_ENV === 'production', // Only secure in production
    });
  }
  return cookieId;
};

/**
 * @swagger
 * /api/vote:
 *   post:
 *     summary: Submit a vote for king and queen
 *     tags: [Votes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vote'
 *     responses:
 *       201:
 *         description: Vote submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request (missing or invalid candidate IDs)
 *       403:
 *         description: Already voted
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const { kingId, queenId } = req.body;

    // Validate input
    if (!kingId || !queenId) {
      return res.status(400).json({ error: 'Both kingId and queenId are required' });
    }

    const ipAddress = getClientIP(req);
    const cookieId = getCookieId(req, res);

    // Check if already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        ipAddress_cookieId: {
          ipAddress,
          cookieId,
        },
      },
    });

    if (existingVote) {
      return res.status(403).json({ error: 'You have already voted', alreadyVoted: true });
    }

    // Validate candidates exist and are correct category
    const king = await prisma.candidate.findFirst({
      where: { id: parseInt(kingId), category: 'king' },
    });
    const queen = await prisma.candidate.findFirst({
      where: { id: parseInt(queenId), category: 'queen' },
    });

    if (!king) {
      return res.status(400).json({ error: 'Invalid king candidate' });
    }
    if (!queen) {
      return res.status(400).json({ error: 'Invalid queen candidate' });
    }

    // Use transaction to ensure atomicity
    await prisma.$transaction([
      // Create vote record
      prisma.vote.create({
        data: {
          ipAddress,
          cookieId,
          kingId: parseInt(kingId),
          queenId: parseInt(queenId),
        },
      }),
      // Increment king vote count
      prisma.candidate.update({
        where: { id: parseInt(kingId) },
        data: { voteCount: { increment: 1 } },
      }),
      // Increment queen vote count
      prisma.candidate.update({
        where: { id: parseInt(queenId) },
        data: { voteCount: { increment: 1 } },
      }),
    ]);

    res.status(201).json({ success: true, message: 'Vote submitted successfully' });
  } catch (error) {
    console.error('Error submitting vote:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(403).json({ error: 'You have already voted', alreadyVoted: true });
    }

    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

/**
 * @swagger
 * /api/check:
 *   get:
 *     summary: Check if user has already voted
 *     tags: [Votes]
 *     responses:
 *       200:
 *         description: Vote status check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasVoted:
 *                   type: boolean
 *       500:
 *         description: Server error
 */
router.get('/check', async (req, res) => {
  try {
    const ipAddress = getClientIP(req);
    const cookieId = getCookieId(req, res);

    const existingVote = await prisma.vote.findUnique({
      where: {
        ipAddress_cookieId: {
          ipAddress,
          cookieId,
        },
      },
    });

    res.json({ hasVoted: !!existingVote });
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({ error: 'Failed to check vote status' });
  }
});

module.exports = router;
