const Emp = require("../Model/EmpModel");
const fs = require('fs');
const path = require('path');

// Get all employees
exports.getAllEmployees = async (req, res, next) => {
    try {
        const employees = await Emp.find().sort({ name: 1 });
        res.status(200).json(employees);
    } catch (error) {
        next(error);
    }
};

// Get single employee
exports.getEmployee = async (req, res, next) => {
    try {
        const employee = await Emp.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json(employee);
    } catch (error) {
        next(error);
    }
};

// Create new employee
exports.createEmployee = async (req, res, next) => {
    try {
        const { name, address, phone, role, status } = req.body;
        let imagePath = '';
        
        if (req.file) {
            imagePath = '/uploads/employees/' + req.file.filename;
        }

        const newEmployee = new Emp({
            name,
            image: imagePath,
            address,
            phone,
            role,
            status
        });

        await newEmployee.save();
        res.status(201).json({ 
            message: "Employee created successfully",
            employee: newEmployee
        });
    } catch (error) {
        next(error);
    }
};

// Update employee
exports.updateEmployee = async (req, res, next) => {
    try {
        const { name, address, phone, role, status } = req.body;
        const updateData = { name, address, phone, role, status };
        
        if (req.file) {
            updateData.image = '/uploads/employees/' + req.file.filename;
            // Delete old image if exists
            const oldEmployee = await Emp.findById(req.params.id);
            if (oldEmployee.image) {
                const oldImagePath = path.join(__dirname, '../public', oldEmployee.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const updatedEmployee = await Emp.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedEmployee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({ 
            message: "Employee updated successfully",
            employee: updatedEmployee
        });
    } catch (error) {
        next(error);
    }
};

// Delete employee
exports.deleteEmployee = async (req, res, next) => {
    try {
        const employee = await Emp.findByIdAndDelete(req.params.id);
        
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Delete associated image
        if (employee.image) {
            const imagePath = path.join(__dirname, '../public', employee.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        next(error);
    }
};