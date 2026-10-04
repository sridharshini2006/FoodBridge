const express = require("express");
const router = express.Router();

const {
 addDonation,
 getDonations
} = require("../controllers/donationController");

router.post("/", addDonation);
router.get("/", getDonations);

module.exports = router;