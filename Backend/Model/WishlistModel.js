const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wishlistItemSchema = new Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "ProductModel", 
        required: true 
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const wishlistSchema = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "UserModel", 
        required: true,
        unique: true 
    },
    items: [wishlistItemSchema]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ "items.productId": 1 });

// Virtual for item count
wishlistSchema.virtual('itemCount').get(function() {
    return this.items.length;
});

module.exports = mongoose.model("WishlistModel", wishlistSchema);