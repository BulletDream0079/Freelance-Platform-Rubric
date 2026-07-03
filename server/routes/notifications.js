const express = require("express");
const ctrl = require("../controllers/notificationController");
const { authRequired } = require("../middleware/auth");
const router = express.Router();

router.get("/", authRequired, ctrl.list);
router.put("/read-all", authRequired, ctrl.markAllRead);
router.put("/:id/read", authRequired, ctrl.markRead);

module.exports = router;
