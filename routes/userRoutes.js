import express from "express";
import bcrypt from "bcryptjs";
import User from "../schema/User.js"; // Import User model using ES Module syntax

const router = express.Router();

const isValidEmail = (email) => {
  const emailRegex =
    /^[A-Za-z0-9][A-Za-z0-9._-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email) && email.length > 0;
};

const isValidFullName = (fullName) => {
  const nameRegex = /^[A-Za-z\s]+$/;
  return nameRegex.test(fullName) && fullName.trim().length > 0;
};

router.post("/user", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!isValidFullName(fullName)) {
      return res.status(400).json({
        message:
          "Full name can only contain letters and spaces and must not be blank.",
      });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    const strongPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export { router as userRouter };
