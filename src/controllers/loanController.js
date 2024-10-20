const Loan = require("../models/Loan");
const Repayment = require("../models/Repayment");

exports.createLoan = async (req, res) => {
  try {
    const { amount, term } = req.body;

    if (!amount || !term) {
      return res
        .status(400)
        .json({ status: false, message: "Amount and term are required" });
    }

    if (typeof amount !== "number" || typeof term !== "number") {
      return res
        .status(400)
        .json({ status: false, message: "Amount and term must be numbers" });
    }
    const loan = new Loan({
      user: req.user._id,
      amount,
      term,
    });

    await loan.save();

    // Generate repayment schedule
    const repaymentAmount = parseFloat((amount / term).toFixed(2));
    const repayments = [];

    for (let i = 0; i < term; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (i + 1) * 7); // Weekly repayments
      repayments.push(
        new Repayment({
          loan: loan._id,
          amount:
            i === term - 1
              ? amount - repaymentAmount * (term - 1)
              : repaymentAmount,
          dueDate,
        })
      );
    }

    await Repayment.insertMany(repayments);

    res.status(201).json({
      status: true,
      message: "Loan created successfully",
      data: { loan, repayments },
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ status: false, message: "Loan not found" });
    }

    if (loan.status !== "PENDING") {
      return res
        .status(400)
        .json({ status: false, message: "Loan is not in PENDING state" });
    }

    loan.status = "APPROVED";
    await loan.save();

    res.status(200).json({
      status: true,
      message: "Loan approved successfully",
      data: { loan },
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

exports.rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ status: false, message: "Loan not found" });
    }

    if (loan.status !== "PENDING") {
      return res
        .status(400)
        .json({ status: false, message: "Loan is not in PENDING state" });
    }

    loan.status = "REJECTED";
    await loan.save();
    res.status(200).json({
      status: true,
      message: "Loan rejected successfully",
      data: { loan },
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

// exports.getUserLoans = async (req, res) => {
//   try {
//     const loans = await Loan.find({ user: req.user._id });
//     const new_loans = await Promise.all(
//       loans.map(async (loan) => {
//         const repayments = await Repayment.find({ loan: loan._id });
//         loan["repayments"] = repayments;
//         return loan;
//       })
//     );
//     res.json(new_loans);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };
exports.getUserLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    const new_loans = await Promise.all(
      loans.map(async (loan) => {
        if (loan.status === "REJECTED" || loan.status === "PAID") {
          const loanObj = loan.toObject();
          loanObj["repayments"] = [];
          return loanObj;
        }
        const repayments = await Repayment.find({ loan: loan._id });
        const loanObj = loan.toObject(); // Convert to plain object
        loanObj["repayments"] = repayments; // Add repayments to the loan object
        return loanObj;
      })
    );
    res.status(200).json({
      status: true,
      message: "Loans fetched successfully",
      data: new_loans,
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name");

    res.status(200).json({
      status: true,
      message: "All loans fetched successfully",
      data: loans,
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};
