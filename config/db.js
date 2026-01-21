// import mongoose from 'mongoose';
// import dotenv from 'dotenv';  // ✅ ADD THIS

// dotenv.config();  // ✅ ADD THIS

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ MongoDB connected successfully');
//   } catch (error) {
//     console.error('❌ MongoDB connection error:', error.message);
//     process.exit(1);
//   }
// };

// export default connectDB;











import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
