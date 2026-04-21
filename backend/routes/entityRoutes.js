const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/entityController");
const requireRole = require("../middleware/requireRole");
router.get("/", auth, ctrl.getAll);
router.post("/", auth, requireRole("ADMIN", "MANAGER"), ctrl.create);
router.put("/:id", auth, requireRole("ADMIN", "MANAGER"), ctrl.updateEntity);
router.delete("/:id", auth, requireRole("ADMIN"), ctrl.delete);

module.exports = router;