// routes/config.js — Save and retrieve user's Canvas + Notion credentials

import { Router } from 'express'
import { requireAuth } from '../services/auth.js'
import { verifyDatabase } from '../services/notionService.js'
import { fetchCourses } from '../services/canvasService.js'
import prisma from '../db/db.js'

const router = Router()

// All config routes require authentication
router.use(requireAuth)

/**
 * GET /api/config
 * Returns the user's current config (with tokens masked for security).
 */
router.get('/', async (req, res) => {
  try {
    const config = await prisma.config.findUnique({
      where: { userId: req.userId },
    })

    if (!config) {
      return res.json({ configured: false })
    }

    // Don't send the actual tokens back to the client — just confirm they exist
    res.json({
      configured: true,
      canvasBaseUrl: config.canvasBaseUrl,
      canvasTokenSet: !!config.canvasToken,
      notionTokenSet: !!config.notionToken,
      notionDbId: config.notionDbId,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to load config.' })
  }
})

/**
 * POST /api/config
 * Saves or updates the user's Canvas + Notion credentials.
 * Also verifies that both connections work before saving.
 * Body: { canvasToken, canvasBaseUrl, notionToken, notionDbId }
 */
router.post('/', async (req, res) => {
  try {
    const { canvasToken, canvasBaseUrl, notionToken, notionDbId } = req.body

    if (!canvasToken || !canvasBaseUrl || !notionToken || !notionDbId) {
      return res.status(400).json({ error: 'All four fields are required.' })
    }

    // Clean up the base URL (remove trailing slash)
    const cleanUrl = canvasBaseUrl.replace(/\/$/, '')

    // Verify Canvas connection by trying to fetch courses
    try {
      await fetchCourses(cleanUrl, canvasToken)
    } catch (err) {
      return res.status(400).json({
        error: 'Could not connect to Canvas. Check your token and URL.',
        detail: err.message,
      })
    }

    // Verify Notion connection and database structure
    const notionCheck = await verifyDatabase(notionToken, notionDbId)
    if (!notionCheck.ok) {
      return res.status(400).json({ error: notionCheck.error })
    }

    // Save config (upsert = create if doesn't exist, update if it does)
    await prisma.config.upsert({
      where: { userId: req.userId },
      create: {
        userId: req.userId,
        canvasToken,
        canvasBaseUrl: cleanUrl,
        notionToken,
        notionDbId,
      },
      update: {
        canvasToken,
        canvasBaseUrl: cleanUrl,
        notionToken,
        notionDbId,
      },
    })

    res.json({
      success: true,
      message: `Connected! Canvas verified and Notion database "${notionCheck.dbTitle}" found.`,
    })
  } catch (err) {
    console.error('Config save error:', err)
    res.status(500).json({ error: 'Failed to save config.' })
  }
})

export default router
