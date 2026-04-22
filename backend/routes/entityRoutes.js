const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/entityController");
const requireRole = require("../middleware/requireRole");
/**
 * @swagger
 * /api/entities:
 *   get:
 *     summary: Get all entities
 *     tags: [Entities]
 */
router.get("/", auth, ctrl.getAll);

/**
 * @swagger
 * /api/entities:
 *   post:
 *     summary: Create entity
 *     tags: [Entities]
 */
router.post("/", auth, requireRole("ADMIN", "MANAGER"), ctrl.create);

/**
 * @swagger
 * /api/entities/{id}:
 *   put:
 *     summary: Update entity
 *     tags: [Entities]
 */
router.put("/:id", auth, requireRole("ADMIN", "MANAGER"), ctrl.updateEntity);

/**
 * @swagger
 * /api/entities/{id}:
 *   delete:
 *     summary: Delete entity
 *     tags: [Entities]
 */
router.delete("/:id", auth, requireRole("ADMIN"), ctrl.delete);
module.exports = router;