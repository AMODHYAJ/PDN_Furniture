const mongoose = require('mongoose');

const deliveryOfficerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password:{

     type:String,
     required:true,
     unique:true

  },
  
  phone: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ['Junior', 'Senior'],
    required: true,
  },
  availableHours: {
    type: [Number], // Change this to an array of numbers
    default: [],
  },
});

module.exports = mongoose.model('DeliveryOfficerModel', deliveryOfficerSchema);

