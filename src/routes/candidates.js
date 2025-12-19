const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authMiddleware } = require('../utils/auth');

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Get all candidates grouped by category
 *     tags: [Candidates]
 *     responses:
 *       200:
 *         description: List of candidates grouped by kings and queens
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
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { id: 'asc' },
    });

    // Group candidates by category
    const grouped = {
      kings: candidates.filter((c) => c.category === 'king'),
      queens: candidates.filter((c) => c.category === 'queen'),
    };

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

/**
 * @swagger
 * /api/candidates/{id}:
 *   get:
 *     summary: Get a single candidate by ID
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await prisma.candidate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Create a new candidate (Admin only)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [king, queen]
 *               photoUrl:
 *                 type: string
 *             required:
 *               - name
 *               - category
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 candidate:
 *                   $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, photoUrl } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    if (!['king', 'queen'].includes(category)) {
      return res.status(400).json({ error: 'Category must be either "king" or "queen"' });
    }

    const candidate = await prisma.candidate.create({
      data: {
        name,
        category,
        photoUrl: photoUrl || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      candidate,
    });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

/**
 * @swagger
 * /api/candidates/{id}:
 *   put:
 *     summary: Update a candidate (Admin only)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [king, queen]
 *               photoUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 candidate:
 *                   $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, photoUrl } = req.body;

    // Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCandidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Validate category if provided
    if (category && !['king', 'queen'].includes(category)) {
      return res.status(400).json({ error: 'Category must be either "king" or "queen"' });
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;

    const candidate = await prisma.candidate.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Candidate updated successfully',
      candidate,
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

/**
 * @swagger
 * /api/candidates/{id}:
 *   delete:
 *     summary: Delete a candidate (Admin only)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCandidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Delete candidate (votes will be handled based on your cascade rules)
    await prisma.candidate.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

module.exports = router;
