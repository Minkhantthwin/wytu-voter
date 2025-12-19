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

/**
 * @swagger
 * /api/check:
 *   get:
 *     summary: Check if user has already voted
 *     tags: [Votes]
 *     responses:
 *       200:
 *         description: Vote status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasVoted:
 *                   type: boolean
 *                 votedAt:
 *                   type: string
 *                   format: date-time
 *                 votedFor:
 *                   type: object
 *                   properties:
 *                     king:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     queen:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const ipAddress = getClientIP(req);
    let cookieId = req.cookies.voter_id;

    // If no cookie, generate one and return hasVoted: false
    if (!cookieId) {
      cookieId = uuidv4();
      res.cookie('voter_id', cookieId, {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: true,
        sameSite: 'lax', // Changed from 'strict' to 'lax' for cross-origin compatibility
        secure: process.env.NODE_ENV === 'production', // Only secure in production
      });
      return res.json({ hasVoted: false, cookieId });
    }

    // Check if vote exists
    const existingVote = await prisma.vote.findUnique({
      where: {
        ipAddress_cookieId: {
          ipAddress,
          cookieId,
        },
      },
      include: {
        king: {
          select: { id: true, name: true },
        },
        queen: {
          select: { id: true, name: true },
        },
      },
    });

    if (existingVote) {
      return res.json({
        hasVoted: true,
        votedAt: existingVote.votedAt,
        votedFor: {
          king: existingVote.king,
          queen: existingVote.queen,
        },
      });
    }

    res.json({ hasVoted: false });
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({ error: 'Failed to check vote status' });
  }
});

module.exports = router;
