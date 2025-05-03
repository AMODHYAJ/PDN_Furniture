const User = require("../Model/UserModel");

const getAllUsers =  async (req , res , next) => {

    let Users;

    try{
        users = await User.find();
    }catch(err){
        console.log(err);
    }

    if(!users){
        return res.status(404).json({message:"User not found"});
    }

    return res.status(200).json({users});
};

//data insert
const addUsers =  async (req , res, next) => {
    
    const{name,email,password,role,createdAt} = req.body;

    let users;

    try{
        users = new User({name,email,password,role,createdAt});
        await users.save();
    }catch(err){
        console.log(err);
    }
    //not insert users
    if(!users){
        return res.status(404).json({message:"unable to add users"});
    }
    return res.status(200).json({users});
};

// Get user by ID
const getById = async (req, res) => {
    try {
      const id = req.params.id;
      
      // Allow admin or the user themselves to access
      if (req.user.role !== 'Admin' && id !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
  
      const user = await User.findById(id, '-password');
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ user });
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  // Update User Details
  const updateUser = async (req, res, next) => {
    try {
      const id = req.params.id;
      
      // Allow admin or the user themselves to update
      if (req.user.role !== 'Admin' && id !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
  
      const { name, email, role } = req.body;
      const updateData = { name, email, role };
  
      // Only allow admin to change roles
      if (req.user.role !== 'Admin') {
        delete updateData.role;
      }
  
      // If password is being updated, hash it
      if (req.body.password) {
        updateData.password = await bcrypt.hash(req.body.password, 12);
      }
  
      const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
      res.status(200).json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };

//Delete User Details
const deleteUser = async (req, res, next) => {

    const id = req.params.id;

    let user;

    try{
        user = await User.findByIdAndDelete(id);
    }catch(err){
        console.log(err);
    }
    if(!user){
        return res.status(404).json({message:"Unable to Delete User Details"});
    }
    return res.status(200).json({user});
}

exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;