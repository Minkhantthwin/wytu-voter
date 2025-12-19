const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authMiddleware } = require('../utils/auth');

// Helper to get a setting value
const getSetting = async (key, defaultValue = null) => {
  const setting = await prisma.setting.findUnique({
    where: { key },
  });
  return setting ? setting.value : defaultValue;
};

// Helper to set a setting value
const setSetting = async (key, value) => {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
};

/**
 * @swagger
 * /api/settings/results-announced:
 *   get:
 *     summary: Check if results have been announced
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Results announcement status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 announced:
 *                   type: boolean
 *       500:
 *         description: Server error
 */
router.get('/results-announced', async (req, res) => {
  try {
    const announced = await getSetting('results_announced', 'false');
    res.json({ announced: announced === 'true' });
  } catch (error) {
    console.error('Error checking results announcement:', error);
    res.status(500).json({ error: 'Failed to check results announcement status' });
  }
});

/**
 * @swagger
 * /api/settings/results-announced:
 *   put:
 *     summary: Toggle results announcement (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               announced:
 *                 type: boolean
 *             required:
 *               - announced
 *     responses:
 *       200:
 *         description: Results announcement updated
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/results-announced', authMiddleware, async (req, res) => {
  try {
    const { announced } = req.body;
    
    if (typeof announced !== 'boolean') {
      return res.status(400).json({ error: 'announced must be a boolean' });
    }

    await setSetting('results_announced', announced.toString());
    
    res.json({ 
      success: true, 
      announced,
      message: announced ? 'Results have been announced!' : 'Results announcement has been hidden.' 
    });
  } catch (error) {
    console.error('Error updating results announcement:', error);
    res.status(500).json({ error: 'Failed to update results announcement' });
  }
});

/**
 * @swagger
 * /api/settings/voting-open:
 *   get:
 *     summary: Check if voting is open
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Voting status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 open:
 *                   type: boolean
 *       500:
 *         description: Server error
 */
router.get('/voting-open', async (req, res) => {
  try {
    const open = await getSetting('voting_open', 'true');
    res.json({ open: open === 'true' });
  } catch (error) {
    console.error('Error checking voting status:', error);
    res.status(500).json({ error: 'Failed to check voting status' });
  }
});

/**
 * @swagger
 * /api/settings/voting-open:
 *   put:
 *     summary: Toggle voting open/closed (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               open:
 *                 type: boolean
 *             required:
 *               - open
 *     responses:
 *       200:
 *         description: Voting status updated
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/voting-open', authMiddleware, async (req, res) => {
  try {
    const { open } = req.body;
    
    if (typeof open !== 'boolean') {
      return res.status(400).json({ error: 'open must be a boolean' });
    }

    await setSetting('voting_open', open.toString());
    
    res.json({ 
      success: true, 
      open,
      message: open ? 'Voting is now open!' : 'Voting has been closed.' 
    });
  } catch (error) {
    console.error('Error updating voting status:', error);
    res.status(500).json({ error: 'Failed to update voting status' });
  }
});

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all settings (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All settings
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [resultsAnnounced, votingOpen] = await Promise.all([
      getSetting('results_announced', 'false'),
      getSetting('voting_open', 'true'),
    ]);

    res.json({
      resultsAnnounced: resultsAnnounced === 'true',
      votingOpen: votingOpen === 'true',
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

module.exports = router;
