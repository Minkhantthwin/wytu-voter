const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

/**
 * @swagger
 * /api/results:
 *   get:
 *     summary: Get vote counts for all candidates
 *     tags: [Results]
 *     responses:
 *       200:
 *         description: Vote results grouped by category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Candidate'
 *                 queens:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Candidate'
 *                 totalVotes:
 *                   type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    // Optional: Admin key protection
    const adminKey = req.query.key || req.headers['x-admin-key'];
    if (process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_KEY) {
      // If ADMIN_KEY is set but not provided/matched, still return results but hide vote counts
      // Or you can uncomment below to fully restrict
      // return res.status(401).json({ error: 'Unauthorized' });
    }

    const candidates = await prisma.candidate.findMany({
      select: {
        id: true,
        name: true,
        photoUrl: true,
        category: true,
        voteCount: true,
      },
      orderBy: { voteCount: 'desc' },
    });

    // Group by category and sort by vote count
    const kings = candidates
      .filter((c) => c.category === 'king')
      .sort((a, b) => b.voteCount - a.voteCount);

    const queens = candidates
      .filter((c) => c.category === 'queen')
      .sort((a, b) => b.voteCount - a.voteCount);

    // Get total votes
    const totalVotes = await prisma.vote.count();

    res.json({
      kings,
      queens,
      totalVotes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

/**
 * @swagger
 * /api/results/summary:
 *   get:
 *     summary: Get winner summary (leading candidates)
 *     tags: [Results]
 *     responses:
 *       200:
 *         description: Current leading king and queen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 king:
 *                   $ref: '#/components/schemas/Candidate'
 *                 queen:
 *                   $ref: '#/components/schemas/Candidate'
 *                 totalVotes:
 *                   type: integer
 *       500:
 *         description: Server error
 */
router.get('/summary', async (req, res) => {
  try {
    const kingWinner = await prisma.candidate.findFirst({
      where: { category: 'king' },
      orderBy: { voteCount: 'desc' },
    });

    const queenWinner = await prisma.candidate.findFirst({
      where: { category: 'queen' },
      orderBy: { voteCount: 'desc' },
    });

    const totalVotes = await prisma.vote.count();

    res.json({
      king: kingWinner,
      queen: queenWinner,
      totalVotes,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
