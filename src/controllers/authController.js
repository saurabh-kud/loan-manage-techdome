const User = require("../models/User");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      isAdmin: isAdmin && isAdmin === true ? true : false,
    });
    const token = generateToken(user._id);

    res.status(201).json({
      status: true,
      message: "User created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        accessToken: token,
      },
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id);
      res.json({
        status: true,
        message: "User logged in successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          accessToken: token,
        },
      });
    } else {
      res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};
