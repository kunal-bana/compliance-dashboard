const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const ctrl = require("../controllers/regulationController");

router.get("/", auth, ctrl.getAll);

router.post("/", auth, requireRole("ADMIN", "MANAGER"), ctrl.create);

router.put("/:id", auth, requireRole("ADMIN", "MANAGER"), ctrl.update);

router.delete("/:id", auth, requireRole("ADMIN"), ctrl.delete);

module.exports = router;