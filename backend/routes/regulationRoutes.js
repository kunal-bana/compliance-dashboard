const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const ctrl = require('../controllers/regulationController');

/**
 * @swagger
 * tags:
 *   name: Regulations
 *   description: Regulation management APIs
 */

/**
 * @swagger
 * /api/regulations:
 *   get:
 *     summary: Get all regulations
 *     description: Retrieve all regulations sorted by creation date (newest first)
 *     tags: [Regulations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Regulations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Regulation'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', auth, ctrl.getAll);

/**
 * @swagger
 * /api/regulations:
 *   post:
 *     summary: Create a new regulation
 *     description: Create a new regulation (requires ADMIN or MANAGER role)
 *     tags: [Regulations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - code
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 150
 *                 example: GST Compliance
 *               code:
 *                 type: string
 *                 pattern: '^[A-Z0-9\-]+$'
 *                 example: GST-01
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Pending, Archived]
 *                 default: Active
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               effectiveDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Regulation created successfully
 *       400:
 *         description: Invalid input or duplicate code
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.post('/', auth, requireRole('ADMIN', 'MANAGER'), ctrl.create);

/**
 * @swagger
 * /api/regulations/{id}:
 *   put:
 *     summary: Update a regulation
 *     description: Update regulation details (requires ADMIN or MANAGER role)
 *     tags: [Regulations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Regulation ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               code:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Pending, Archived]
 *               description:
 *                 type: string
 *               effectiveDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Regulation updated successfully
 *       400:
 *         description: Invalid input or duplicate code
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Regulation not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, requireRole('ADMIN', 'MANAGER'), ctrl.update);

/**
 * @swagger
 * /api/regulations/{id}:
 *   delete:
 *     summary: Delete a regulation
 *     description: Delete a regulation permanently (requires ADMIN role only)
 *     tags: [Regulations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Regulation ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Regulation deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Regulation not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, requireRole('ADMIN'), ctrl.delete);

module.exports = router;