const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/requireRole');
const ctrl = require('../controllers/taskController');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieve all tasks sorted by creation date (newest first)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
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
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', auth, ctrl.getAll);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Create a new task (requires ADMIN or MANAGER role). Due date cannot be in the past.
 *     tags: [Tasks]
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
 *               - entityId
 *               - regulationId
 *               - assignedTo
 *               - dueDate
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Submit Report
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               entityId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               regulationId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *               assignedTo:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439013
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed, On Hold, Cancelled]
 *                 default: Pending
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 default: Medium
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *                 maxLength: 2000
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input or past due date
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Entity, Regulation, or User not found
 *       500:
 *         description: Server error
 */
router.post('/', auth, role('ADMIN', 'MANAGER'), ctrl.create);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: Update task details (requires ADMIN or MANAGER role)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               entityId:
 *                 type: string
 *               regulationId:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed, On Hold, Cancelled]
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               completedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid input or ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Task, Entity, Regulation, or User not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, role('ADMIN', 'MANAGER'), ctrl.update);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Delete a task permanently (requires ADMIN role only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, role('ADMIN'), ctrl.delete);

module.exports = router;