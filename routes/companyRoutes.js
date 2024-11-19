import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Company from "../schema/Company.js"; // Import the new schema

const router = express.Router();

// Configure multer for image uploads
const companyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "company-images";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const companyUpload = multer({
  storage: companyStorage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      req.fileValidationError = "Only JPEG, PNG, and GIF files are allowed.";
      return cb(null, false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
}).single("image");

// Route to upload a company image
router.post("/uploadCompanyImage", (req, res) => {
  companyUpload(req, res, async (err) => {
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: "File upload error.", error: err });
    } else if (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }

    try {
      const { companyName } = req.body;

      if (!companyName) {
        return res
          .status(400)
          .json({ message: "Company name must be provided." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      const newCompanyImage = new Company({
        companyName,
        imagePath: `company-images/${req.file.filename}`,
      });

      await newCompanyImage.save();

      res.status(201).json({
        message: "Company image uploaded successfully!",
        data: newCompanyImage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  });
});

router.get("/getCompanyImages", async (req, res) => {
  try {
    const images = await Company.find({}, "companyName imagePath").sort({
      createdAt: -1,
    }); // Optional: Sort by newest first

    if (!images || images.length === 0) {
      return res.status(404).json({ message: "No company images found." });
    }

    res
      .status(200)
      .json({ message: "Company images retrieved successfully!", images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

export { router as companyRouter };
