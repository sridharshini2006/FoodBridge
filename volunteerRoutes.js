const express = require("express");
const router = express.Router();

const {
 assignVolunteer,
 updateStatus
} = require("../controllers/volunteerController");

router.put("/assign/:id", assignVolunteer);
router.put("/status/:id", updateStatus);

module.exports = router;