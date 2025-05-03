const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    orderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "OrderModel",  // Reference to the OrderModel
        required: true 
    },
    originalOrderStatus: { type: String, default: "processing" }, // Track original status
    priorityLevel: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    tasks: [{
        taskName: String,
        assignedTo: { type: Schema.Types.ObjectId, ref: "EmpModel" },
        status: { type: String, default: "Pending" },
        estimatedTime: Number,
        dueDate: Date,
    }],
    totalEstimatedTime: Number,
    riskLevel: { type: String, default: "Low" },
    customerApproval: { type: String, enum: ["Pending", "Approved", "Declined"], default: "Pending" },
    progress: { type: Number, default: 0 },
    dispatchStatus: { type: Boolean, default: false },
    // Add reference to original order
    originalOrder: { type: Schema.Types.ObjectId, ref: "OrderModel" }
}, { collection: 'taskmodels' });


module.exports = mongoose.model("TaskModel", taskSchema, 'taskmodels');