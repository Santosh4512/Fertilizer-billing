const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Fertilizer DB Connected 🚀");
    
    await mongoose.connection.db.collection("products").insertOne({
      name: "Urea",
      price: 500,
      stock: 100
    });
    console.log("👉 If this works → ✅ Everything is perfect");
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

testConnection();
