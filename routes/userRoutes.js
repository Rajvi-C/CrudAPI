import express from "express";
import bcrypt from "bcryptjs";
import User from "../schema/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";

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

const isValidPassword = (password) => {
  const strongPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
  return strongPassword.test(password);
};

router.post("/create", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Inadequate details to create user",
      });
    }

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

    if (!isValidPassword(password)) {
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

router.put("/edit", async (req, res) => {
  try {
    const { email, fullName, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }

    if (!fullName && !password) {
      return res.status(400).json({ message: "No field provided to update." });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (fullName) {
      if (!isValidFullName(fullName)) {
        return res.status(400).json({
          message:
            "Full name must contain only letters and spaces and cannot be blank.",
        });
      }
      user.fullName = fullName;
    }

    if (password) {
      if (!isValidPassword(password)) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (!fullName && !password) {
      return res.status(400).json({ message: "No field provided to update." });
    }

    await user.save();

    res
      .status(200)
      .json({ message: `User details of ${email} updated successfully!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email Id must be provided" });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await User.deleteOne({ email });

    res
      .status(200)
      .json({ message: `User with email ${email} deleted successfully!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/getAll", async (req, res) => {
  try {
    const users = await User.find({}, "fullName email password"); // Select specific fields to return

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "images";

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error("Only JPEG, PNG, and GIF files are allowed."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

router.post("/uploadImage", upload, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email Id must be provided" });
    }
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = `images/${req.file.filename}`;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the user document with the image path
    user.imagePath = filePath;
    await user.save();

    // Send a success response with the file path
    res.status(200).json({
      message: "Image uploaded successfully!",
      filePath: filePath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

export { router as userRouter };
