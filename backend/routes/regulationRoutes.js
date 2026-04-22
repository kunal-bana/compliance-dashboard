const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const ctrl = require("../controllers/regulationController");

/**
 * @swagger
 * /api/regulations:
 *   get:
 *     summary: Get all regulations
 *     tags: [Regulations]
 */
router.get("/", auth, ctrl.getAll);

/**
 * @swagger
 * /api/regulations:
 *   post:
 *     summary: Create regulation
 *     tags: [Regulations]
 */
router.post("/", auth, requireRole("ADMIN", "MANAGER"), ctrl.create);

/**
 * @swagger
 * /api/regulations/{id}:
 *   put:
 *     summary: Update regulation
 *     tags: [Regulations]
 */
router.put("/:id", auth, requireRole("ADMIN", "MANAGER"), ctrl.update);

/**
 * @swagger
 * /api/regulations/{id}:
 *   delete:
 *     summary: Delete regulation
 *     tags: [Regulations]
 */
router.delete("/:id", auth, requireRole("ADMIN"), ctrl.delete);

module.exports = router;