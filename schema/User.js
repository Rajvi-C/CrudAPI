import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
    enum: ["employee", "admin"],
    message: "Type must be either 'employee' or 'admin'.",
  },
});

const User = mongoose.model("User", userSchema);

export default User;
