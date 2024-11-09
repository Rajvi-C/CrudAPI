import express from "express";
import path from "path";
import { userRouter } from "./routes/userRoutes.js";
import connectDB from "./config/db.js";

const app = express();

app.use(express.json());

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use("/images", express.static(path.join(__dirname, "images")));

connectDB();

app.use("/user", userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
