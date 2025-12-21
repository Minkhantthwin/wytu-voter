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
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return cookieId;
};

/**
 * @swagger
 * /api/check:
 *   get:
 *     summary: Check if user has already voted
 *     tags: [Votes]
 *     parameters:
 *       - in: query
 *         name: fingerprint
 *         schema:
 *           type: string
 *         description: Device fingerprint
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
router.get('/', async (req, res) => {
  try {
    const { fingerprint } = req.query;
    const ipAddress = getClientIP(req);
    const cookieId = getCookieId(req, res);

    // Check by fingerprint first (if provided)
    if (fingerprint) {
      const existingVoteByFingerprint = await prisma.vote.findUnique({
        where: { fingerprint },
      });

      if (existingVoteByFingerprint) {
        return res.json({ hasVoted: true });
      }
    }

    // Also check by IP + cookie
    const existingVoteByCookie = await prisma.vote.findUnique({
      where: {
        ipAddress_cookieId: {
          ipAddress,
          cookieId,
        },
      },
    });

    res.json({ hasVoted: !!existingVoteByCookie });
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({ error: 'Failed to check vote status' });
  }
});

module.exports = router;
