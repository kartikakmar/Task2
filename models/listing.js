const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
   title: {
      type: String,
      required: true, // ✅ Fixed typo
   },
   description: {
      type: String,
      default: "No description provided.", // ✅ Default value
   },
   author: {
      type: String,
      required: true, // ✅ Fixed typo
   },
   price: {
      type: Number,
      required: true, // ✅ Ensure price is always required
      min: 0, // ✅ Prevent negative prices
   },
   image: {
      url: { type: String, required: true }, // ✅ Store Cloudinary URL
      filename: { type: String }, // ✅ Store Cloudinary file name (optional)
   },
});

// Create model
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
