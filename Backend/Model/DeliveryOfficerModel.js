const mongoose = require('mongoose');

const deliveryOfficerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\d\s\-()+]+$/, 'Invalid phone number format']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: {
      values: ['Junior', 'Senior'],
      message: 'Role must be either Junior or Senior'
    },
    required: true,
    default: 'Junior'
  },
  availableHours: {
    type: [Number],
    default: [],
    validate: {
      validator: function(hours) {
        return hours.every(h => h >= 0 && h <= 23);
      },
      message: 'Available hours must be between 0 and 23'
    }
  }
}, {
  timestamps: true
});

// Add index for better performance on availability queries
deliveryOfficerSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('DeliveryOfficerModel', deliveryOfficerSchema);

