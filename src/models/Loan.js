const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  term: { type: Number, required: true },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "PAID", "REJECTED"],
    default: "PENDING",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Loan", loanSchema);
