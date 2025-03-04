const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  nama: { type: String, required: true },
  deskripsi: { type: String },
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
