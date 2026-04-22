const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const ctrl = require("../controllers/regulationController");

/**
 * @swagger
 * tags:
 *   name: Regulations
 *   description: Regulation APIs
 */

/**
 * @swagger
 * /api/regulations:
 *   get:
 *     summary: Get all regulations
 *     tags: [Regulations]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", auth, ctrl.getAll);

/**
 * @swagger
 * /api/regulations:
 *   post:
 *     summary: Create regulation
 *     tags: [Regulations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Regulation'
 */
router.post("/", auth, requireRole("ADMIN", "MANAGER"), ctrl.create);

/**
 * @swagger
 * /api/regulations/{id}:
 *   put:
 *     summary: Update regulation
 *     tags: [Regulations]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", auth, requireRole("ADMIN", "MANAGER"), ctrl.update);

/**
 * @swagger
 * /api/regulations/{id}:
 *   delete:
 *     summary: Delete regulation
 *     tags: [Regulations]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", auth, requireRole("ADMIN"), ctrl.delete);

module.exports = router;