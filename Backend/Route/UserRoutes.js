const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const UserController = require("../Controllers/UserController");

router.get("/",authenticate,UserController.getAllUsers);
router.post("/",UserController.addUsers);
router.get("/:id",authenticate,UserController.getById);
router.put("/:id",authenticate,UserController.updateUser);
router.delete("/:id",authenticate,UserController.deleteUser);

module.exports = router;