const express = require("express");
const router = express.Router();
const EmpController = require("../Controllers/EmpController");
const employeeUpload = require("../middleware/employeeUpload"); // For image uploads

// Employee CRUD routes
router.get("/", EmpController.getAllEmployees);
router.get("/:id", EmpController.getEmployee);
router.post("/", employeeUpload.single('image'), EmpController.createEmployee);
router.put("/:id", employeeUpload.single('image'), EmpController.updateEmployee);
router.delete("/:id", EmpController.deleteEmployee);

module.exports = router;