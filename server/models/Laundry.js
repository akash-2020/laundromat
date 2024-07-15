const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const LaundrySchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'customers', // Refers to the 'customers' collection/model
    required: true
  },
  dropOffDate: {
    type: Date,
    required: true
  },
  pickUpDate: {
    type: Date,
    required: true
  },
  loads: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

// Add a virtual field to fetch the customer name along with the laundry
LaundrySchema.virtual('customerName', {
  ref: 'customers', // Refers to the 'customers' collection/model
  localField: 'customerId',
  foreignField: '_id',
  justOne: true // Only fetch one customer
});

// Apply the population to the virtual field
LaundrySchema.pre('find', function() {
  this.populate('customerName');
});

module.exports = mongoose.model('laundries', LaundrySchema);
