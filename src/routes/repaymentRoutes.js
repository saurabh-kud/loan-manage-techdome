const express = require("express");
const { addRepayment } = require("../controllers/repaymentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, addRepayment);

module.exports = router;
