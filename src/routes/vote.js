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
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
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
 *             type: object
 *             required:
 *               - kingId
 *               - queenId
 *             properties:
 *               kingId:
 *                 type: integer
 *               queenId:
 *                 type: integer
 *               fingerprint:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vote submitted successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Already voted
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const { kingId, queenId, fingerprint } = req.body;

    // Validate input
    if (!kingId || !queenId) {
      return res.status(400).json({ error: 'Both kingId and queenId are required' });
    }

    if (!fingerprint) {
      return res.status(400).json({ error: 'Device fingerprint is required' });
    }

    const ipAddress = getClientIP(req);
    const cookieId = getCookieId(req, res);

    // Check if already voted by fingerprint (primary check)
    const existingVoteByFingerprint = await prisma.vote.findUnique({
      where: { fingerprint },
    });

    if (existingVoteByFingerprint) {
      return res.status(403).json({ 
        error: 'You have already voted from this device', 
        alreadyVoted: true 
      });
    }

    // Also check by IP + cookie as backup
    const existingVoteByCookie = await prisma.vote.findUnique({
      where: {
        ipAddress_cookieId: {
          ipAddress,
          cookieId,
        },
      },
    });

    if (existingVoteByCookie) {
      return res.status(403).json({ 
        error: 'You have already voted', 
        alreadyVoted: true 
      });
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
      // Create vote record with fingerprint
      prisma.vote.create({
        data: {
          ipAddress,
          cookieId,
          fingerprint,
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

module.exports = router;
