/* eslint-disable */
const mongoose = require('mongoose');
mongoose.plugin(require('../utils/softDeletePlugin'));

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;