const express = require("express");
const router = express.Router();
const {
    createOfficer,
    getAllOfficers,
    updateOfficer,
    deleteOfficer,
    toggleAvailability,
    getOfficerById
  } = require("../Controllers/deliveryOfficerController");
const authenticate = require("../middleware/authenticate");
const isAdmin = require("../middleware/isAdmin");

router.post("/", authenticate, isAdmin, createOfficer);
router.get("/", authenticate, isAdmin, getAllOfficers);
router.put("/:id", authenticate, isAdmin, updateOfficer);
router.delete("/:id", authenticate, isAdmin, deleteOfficer);
router.patch("/:id/availability", authenticate, isAdmin, toggleAvailability);
router.get("/:id", authenticate, isAdmin, getOfficerById);

module.exports = router;