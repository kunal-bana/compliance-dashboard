const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/requireRole");
const ctrl = require("../controllers/taskController");

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 */
router.get("/", auth, ctrl.getAll);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create task
 *     tags: [Tasks]
 */
router.post("/", auth, role("ADMIN", "MANAGER"), ctrl.create);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 */
router.put("/:id", auth, role("ADMIN", "MANAGER"), ctrl.update);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 */
router.delete("/:id", auth, role("ADMIN"), ctrl.delete);

module.exports = router;