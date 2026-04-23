const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const ctrl = require('../controllers/entityController');

/**
 * @swagger
 * tags:
 *   name: Entities
 *   description: Entity management APIs
 */

/**
 * @swagger
 * /api/entities:
 *   get:
 *     summary: Get all entities
 *     description: Retrieve all entities sorted by creation date (newest first)
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Entities retrieved successfully
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
 *                     $ref: '#/components/schemas/Entity'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', auth, ctrl.getAll);

/**
 * @swagger
 * /api/entities:
 *   post:
 *     summary: Create a new entity
 *     description: Create a new entity (requires ADMIN or MANAGER role)
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Company A
 *               type:
 *                 type: string
 *                 minLength: 2
 *                 example: Finance
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Pending, Suspended]
 *                 default: Active
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Entity created successfully
 *       400:
 *         description: Invalid input
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
 * /api/entities/{id}:
 *   put:
 *     summary: Update an entity
 *     description: Update entity details (requires ADMIN or MANAGER role)
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Pending, Suspended]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Entity updated successfully
 *       400:
 *         description: Invalid input or ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Entity not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, requireRole('ADMIN', 'MANAGER'), ctrl.updateEntity);

/**
 * @swagger
 * /api/entities/{id}:
 *   delete:
 *     summary: Delete an entity
 *     description: Delete an entity permanently (requires ADMIN role only)
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Entity deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Entity not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, requireRole('ADMIN'), ctrl.delete);

module.exports = router;