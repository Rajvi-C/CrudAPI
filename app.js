import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // For __dirname in ES modules
import { userRouter } from "./routes/userRoutes.js";
import connectDB from "./config/db.js";
import { companyRouter } from "./routes/companyRoutes.js";
import { jobRouter } from "./routes/jobRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static directories
app.use("/images", express.static(path.join(__dirname, "./images"))); // Adjust path if necessary
app.use(
  "/company-images",
  express.static(path.join(__dirname, "./company-images"))
);

// Database connection
connectDB();

// Routes
app.use("/user", userRouter);
app.use("/company", companyRouter);
app.use("/job", jobRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
