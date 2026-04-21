const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/requireRole");
const ctrl = require("../controllers/userController");

// ADMIN
router.post("/create", auth, role("ADMIN"), ctrl.createUser);
router.get("/", auth, role("ADMIN", "MANAGER"), ctrl.getUsers);
router.put("/role/:id", auth, role("ADMIN"), ctrl.updateUserRole);
router.delete("/:id", auth, role("ADMIN"), ctrl.deleteUser);

// USER
router.get("/me", auth, ctrl.getProfile);
router.post("/change-password", auth, ctrl.changePassword);

module.exports = router;