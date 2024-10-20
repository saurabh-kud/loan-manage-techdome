const Repayment = require("../models/Repayment");
const Loan = require("../models/Loan");

exports.addRepayment = async (req, res) => {
  try {
    const { loanId, amount } = req.body;
    const loan = await Loan.findOne({ _id: loanId, user: req.user._id });

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    if (loan.status === "PENDING") {
      return res.status(400).json({ message: "Loan is pending" });
    }

    const nextRepayment = await Repayment.findOne({
      loan: loanId,
      status: "PENDING",
    }).sort("dueDate");

    if (!nextRepayment) {
      return res
        .status(400)
        .json({ status: false, message: "No pending repayments found" });
    }

    if (amount < nextRepayment.amount) {
      return res.status(400).json({
        status: false,
        message: "Repayment amount is less than the scheduled amount",
      });
    }

    nextRepayment.status = "PAID";
    await nextRepayment.save();

    const remainingRepayments = await Repayment.countDocuments({
      loan: loanId,
      status: "PENDING",
    });

    if (remainingRepayments === 0) {
      loan.status = "PAID";
      await loan.save();
    }

    res.json({
      status: true,
      message: "Repayment added successfully",
      data: { repayment: nextRepayment },
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};
