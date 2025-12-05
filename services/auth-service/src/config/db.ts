import mongoose from "mongoose";

const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/auth-service";
mongoose.connect(DB_URI).then(() => {
  console.log("DB Connected successfully");
});
