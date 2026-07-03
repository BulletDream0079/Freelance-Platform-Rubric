const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");

async function notify(userId, type, message, link = null) {
  try {
    return await Notification.create({ user: userId, type, message, link });
  } catch (e) {
    console.error("notify failed:", e.message);
    return null;
  }
}

async function logActivity(actorId, action, entityType = null, entityId = null, meta = {}) {
  try {
    return await ActivityLog.create({ actor: actorId, action, entityType, entityId, meta });
  } catch (e) {
    console.error("logActivity failed:", e.message);
    return null;
  }
}

module.exports = { notify, logActivity };
