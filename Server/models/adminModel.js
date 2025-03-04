import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username harus diisi"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email harus diisi"],
    unique: true,
    match: [/.+\@.+\..+/, "Email tidak valid"], // Validasi email
  },
  password: {
    type: String,
    required: [true, "Password harus diisi"],
    minlength: [6, "Password minimal 6 karakter"],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Hash password sebelum menyimpan admin baru
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
