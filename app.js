import express from "express";
import connectDB from "./config/db.js";
import { userRouter } from "./routes/userRoutes.js";

const app = express();

app.use(express.json());

connectDB();

app.use(userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
