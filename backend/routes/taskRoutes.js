const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/requireRole");
const ctrl = require("../controllers/taskController");

router.get("/", auth, ctrl.getAll);
router.post("/", auth, role("ADMIN", "MANAGER"), ctrl.create);
router.put("/:id", auth, role("ADMIN", "MANAGER"), ctrl.update);
router.delete("/:id", auth, role("ADMIN"), ctrl.delete);

module.exports = router;