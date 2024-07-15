// models/Customer.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const CustomerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: () => {
      const now = new Date();
      // Adjust for UTC-3 (Nova Scotia)
      now.setHours(now.getHours() - 3);
      return now;
    }
  }
});

module.exports = mongoose.model('customers', CustomerSchema);
