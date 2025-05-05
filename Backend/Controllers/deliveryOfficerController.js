const DeliveryOfficer = require("../Model/DeliveryOfficerModel");
const bcrypt = require('bcryptjs');

// Create new delivery officer
exports.createOfficer = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    // Validate inputs
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Check if email exists
    const existingOfficer = await DeliveryOfficer.findOne({ email });
    if (existingOfficer) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create officer
    const officer = new DeliveryOfficer({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'Junior',
      isAvailable: true
    });

    await officer.save();

    // Return without password
    const officerData = officer.toObject();
    delete officerData.password;

    res.status(201).json({
      success: true,
      officer: officerData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create officer",
      error: error.message
    });
  }
};

// Get all officers
exports.getAllOfficers = async (req, res) => {
  try {
    const officers = await DeliveryOfficer.find().select('-password');
    res.status(200).json({
      success: true,
      officers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch officers",
      error: error.message
    });
  }
};

// Update officer
exports.updateOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const officer = await DeliveryOfficer.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).select('-password');

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found"
      });
    }

    res.status(200).json({
      success: true,
      officer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update officer",
      error: error.message
    });
  }
};

// Delete officer
exports.deleteOfficer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if officer has assigned orders
    const assignedOrders = await Order.countDocuments({ 
      deliveryOfficer: id,
      status: { $in: ['shipped', 'in_transit'] }
    });

    if (assignedOrders > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete officer with active deliveries"
      });
    }

    const officer = await DeliveryOfficer.findByIdAndDelete(id);

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Officer deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete officer",
      error: error.message
    });
  }
};

// Toggle availability
exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const officer = await DeliveryOfficer.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true }
    ).select('-password');

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found"
      });
    }

    res.status(200).json({
      success: true,
      officer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update availability",
      error: error.message
    });
  }
};

exports.getOfficerById = async (req, res) => {
  try {
    const officer = await DeliveryOfficer.findById(req.params.id).select('-password');
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found"
      });
    }
    res.status(200).json({
      success: true,
      officer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch officer",
      error: error.message
    });
  }
};