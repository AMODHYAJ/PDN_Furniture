const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductModel", required: true },
            quantity: { type: Number, required: true, default: 1 }
        }
    ]
});

module.exports = mongoose.model("CartModel", cartSchema);