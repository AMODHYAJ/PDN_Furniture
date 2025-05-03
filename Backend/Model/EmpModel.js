const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const empSchema = new Schema({
    name: { type: String, required: true },
    image: { type: String }, // Will store image path
    address: { type: String, required: true },
    phone: { type: String, required: true },
    role: { 
        type: String, 
        required: true,
        enum: ["Carpenter", "Assembler", "Polisher", "QA Engineer", "Supervisor"] 
    },
    status: {
        type: String,
        required: true,
        enum: ["Active", "On Leave"],
        default: "Active"
    },
    joinDate: {
        type: Date,
        default: Date.now
    }
}, { collection: 'employees' });

module.exports = mongoose.model("EmpModel", empSchema, 'employees');