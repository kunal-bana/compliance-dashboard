const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const ctrl = require("../controllers/entityController");

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
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", auth, ctrl.getAll);

/**
 * @swagger
 * /api/entities:
 *   post:
 *     summary: Create entity
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Entity'
 */
router.post("/", auth, requireRole("ADMIN", "MANAGER"), ctrl.create);

/**
 * @swagger
 * /api/entities/{id}:
 *   put:
 *     summary: Update entity
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", auth, requireRole("ADMIN", "MANAGER"), ctrl.updateEntity);

/**
 * @swagger
 * /api/entities/{id}:
 *   delete:
 *     summary: Delete entity
 *     tags: [Entities]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", auth, requireRole("ADMIN"), ctrl.delete);

module.exports = router;