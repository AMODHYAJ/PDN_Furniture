const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Customer"], default: "Customer" },
  },
  { timestamps: true } // Adds `createdAt` and `updatedAt` fields automatically
);

module.exports = mongoose.model("UserModel", userSchema);