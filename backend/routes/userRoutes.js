const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/requireRole");
const ctrl = require("../controllers/userController");

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/", auth, role("ADMIN", "MANAGER"), ctrl.getUsers);

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post("/create", auth, role("ADMIN"), ctrl.createUser);

/**
 * @swagger
 * /api/users/role/{id}:
 *   put:
 *     summary: Update user role
 *     tags: [Users]
 */
router.put("/role/:id", auth, role("ADMIN"), ctrl.updateUserRole);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 */
router.delete("/:id", auth, role("ADMIN"), ctrl.deleteUser);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 */
router.get("/me", auth, ctrl.getProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Users]
 */
router.post("/change-password", auth, ctrl.changePassword);

module.exports = router;