const express = require("express");
const router = express.Router();

const {
 verifyDonor,
 deleteDonation
} = require("../controllers/adminController");

router.put("/verify/:id", verifyDonor);
router.delete("/donation/:id", deleteDonation);

module.exports = router;