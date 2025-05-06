const Task = require("../Model/TaskModel");
const Emp = require("../Model/EmpModel");
const AI = require("../Utils/taskAI");
const OrderIntegration = require("../services/OrderIntegration");
const Order = require("../Model/OrderModel");

// 1️⃣ Fetch all orders sorted by priority
const getOrdersByPriority = async (req, res, next) => {
    try {
        const tasks = await Task.find().sort({ priorityLevel: -1 });
        return res.status(200).json(tasks);
    } catch (error) {
        next(error); // Passes error to middleware
    }
};

//  2️⃣ Preview AI-generated tasks before saving
const previewTaskSchedule = async (req, res, next) => {
    const { orderId, orderData, deadline } = req.body;

    try {
        // Extract relevant information from orderData to use as requirements
        let requirements = `Order ID: ${orderId}\n`;
        for (const key in orderData) {
            if (orderData.hasOwnProperty(key) && key !== '_id' && key !== '__v' && key !== 'tasks' && key !== 'totalEstimatedTime' && key !== 'progress' && key !== 'dispatchStatus') {
                requirements += `${key}: ${orderData[key]}\n`;
            }
        }

        const aiResponse = await AI.generateTasks({ requirements: requirements, deadline });

        if (!aiResponse) {
            return res.status(500).json({ message: "AI task generation failed." });
        }

        return res.status(200).json({
            message: "AI-generated tasks ready for review.",
            tasks: aiResponse.tasks,
            totalEstimatedTime: aiResponse.totalEstimatedTime,
            riskLevel: aiResponse.riskLevel,
            suggestedNewDeadline: aiResponse.suggestedNewDeadline || null
        });

    } catch (error) {
        next(error);
    }
};

// Helper function to extract/generate requirements from order data
function generateRequirementsFromOrderData(orderData) {
    // This is a placeholder - implement your logic here based on your order data structure
    if (orderData && orderData.orderId) {
        return `Generate a task schedule for order ID: ${orderData.orderId}. Consider the priority level: ${orderData.priorityLevel}.`;
    }
    return "Generate a task schedule based on the available order information.";
}

// 3️⃣ Save AI-generated task schedule by updating the existing order
const saveTaskSchedule = async (req, res, next) => {
    const { orderId, tasks, totalEstimatedTime, riskLevel, suggestedNewDeadline } = req.body;

    try {
        // Validate employee assignments
        const hasUnassignedTasks = tasks.tasks.some(task => !task.assignedTo);
        if (hasUnassignedTasks) {
            return res.status(400).json({ message: "All tasks must have assigned employees" });
        }

        // Verify the order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update the order document
        const updatedOrder = await Task.findOneAndUpdate(
            { orderId: orderId },
            {
                customerApproval: "Approved",
                productionStatus: "Processing",
                tasks: tasks.tasks,
                totalEstimatedTime: totalEstimatedTime,
                riskLevel: riskLevel,
                suggestedNewDeadline: suggestedNewDeadline || null,
            },
            { new: true, upsert: true } // Create if doesn't exist
        );

        // Update the original order status
        await Order.findByIdAndUpdate(orderId, { status: "in_production" });

        return res.status(200).json({ 
            message: "Order updated with generated tasks", 
            updatedOrder 
        });

    } catch (error) {
        console.error("Error updating order:", error);
        next(error);
    }
};

// 4️⃣ Update Task Priority, Manual Assignment, and Edit Production Timeline
const updateTaskSchedule = async (req, res, next) => {
    const { id } = req.params;
    const { priorityLevel, tasks } = req.body;
    try {
        const updatedTask = await Task.findByIdAndUpdate(id, { priorityLevel, tasks }, { new: true });
        return res.status(200).json(updatedTask);
    } catch (error) {
        next(error);
    }
};

// 5️⃣ Track progress of an order
const trackOrderProgress = async (req, res, next) => {
    const { id } = req.params;
    try {
        const order = await Task.findById(id);
        return res.status(200).json({ progress: order.progress });
    } catch (error) {
        next(error);
    }
};

// 6️⃣ Alert if a task is delayed
const checkForDelays = async (req, res, next) => {
    try {
        const delayedTasks = await Task.find({ "tasks.dueDate": { $lt: new Date() }, "tasks.status": "Pending" });
        return res.status(200).json(delayedTasks);
    } catch (error) {
        next(error);
    }
};

// 7️⃣ Get tasks assigned to a specific employee
const getTasksByEmployee = async (req, res, next) => {
    const { employeeId } = req.params;

    try {
        const tasks = await Task.find({ "tasks.assignedTo": employeeId })
            .populate("tasks.assignedTo", "name skill")
            .exec();

        return res.status(200).json({ tasks });
    } catch (error) {
        next(error);
    }
};

// 8️⃣ Update Task Progress (Mark as In Progress / Completed)
const updateTaskProgress = async (req, res, next) => {
    const { taskId, status } = req.body;
    try {
        // Find the task schedule containing this task
        const taskSchedule = await Task.findOne({ "tasks._id": taskId });

        if (!taskSchedule) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Update task status
        const updatedTasks = taskSchedule.tasks.map(task => {
            if (task._id.toString() === taskId) {
                task.status = status;
            }
            return task;
        });

        // Calculate new progress percentage
        const totalTasks = updatedTasks.length;
        const completedTasks = updatedTasks.filter(task => task.status === "Completed").length;
        const newProgress = Math.round((completedTasks / totalTasks) * 100);

        // Update the task schedule
        taskSchedule.tasks = updatedTasks;
        taskSchedule.progress = newProgress;

        await taskSchedule.save();

        // Check if all tasks are completed
        if (newProgress === 100) {
            // Update the associated order status to "shipped"
            await OrderIntegration.updateOrderStatus(taskSchedule.orderId, "shipped");
        }

        return res.status(200).json({ 
            message: "Task status updated.", 
            taskSchedule,
            progress: newProgress
        });
    } catch (error) {
        next(error);
    }
};


// New endpoint to sync with orders
const syncWithOrders = async (req, res, next) => {
    try {
        const result = await OrderIntegration.syncProcessingOrders();
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};


exports.syncWithOrders = syncWithOrders;
exports.getOrdersByPriority = getOrdersByPriority;
exports.previewTaskSchedule = previewTaskSchedule;
exports.saveTaskSchedule = saveTaskSchedule;
exports.updateTaskSchedule = updateTaskSchedule;
exports.trackOrderProgress = trackOrderProgress;
exports.checkForDelays = checkForDelays;
exports.getTasksByEmployee = getTasksByEmployee;
exports.updateTaskProgress = updateTaskProgress;