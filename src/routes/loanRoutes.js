const express = require("express");
const {
  createLoan,
  approveLoan,
  rejectLoan,
  getUserLoans,
  getAllLoans,
} = require("../controllers/loanController");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createLoan);
router.get("/admin", protect, admin, getAllLoans);
router.get("/:id/approve", protect, admin, approveLoan);
router.get("/:id/reject", protect, admin, rejectLoan);
router.get("/user", protect, getUserLoans);

module.exports = router;
