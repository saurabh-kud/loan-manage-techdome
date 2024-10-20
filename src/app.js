const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const loanRoutes = require("./routes/loanRoutes");
const repaymentRoutes = require("./routes/repaymentRoutes");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    msg: "server is working fine🚀🚀",
    api_doc: "https://documenter.getpostman.com/view/38681155/2sAXxY2TJw",
  });
});

app.get("/api", (req, res) => {
  res.json({
    msg: "server api is working fine🚀🚀",
    api_doc: "https://documenter.getpostman.com/view/38681155/2sAXxY2TJw",
  });
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/repayments", repaymentRoutes);

app.use(errorHandler);

module.exports = app;
