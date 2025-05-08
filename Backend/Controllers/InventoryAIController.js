const Inventory = require("../Model/InventoryModel");
const Notification = require("../Model/NotificationModel");
const Product = require("../Model/ProductModel");

class InventoryAI {
  // Predictive Replenishment Algorithm
  static async autoReplenishCheck() {
    try {
      const lowStockItems = await Inventory.find({
        $expr: { $lte: ["$quantity", "$reorderThreshold"] },
        autoReorder: true,
      }).populate("supplier");

      for (const item of lowStockItems) {
        // Calculate order quantity based on historical usage
        const productsUsingMaterial = await Product.find({
          material: item.materialName,
        });

        const weeklyUsage = productsUsingMaterial.length * 2; // Avg 2 units per product per week
        const orderQuantity = Math.max(
          item.supplier.minimumOrder,
          Math.ceil(weeklyUsage * (item.leadTime / 7) * 1.2) // 20% buffer
        );

        // Create purchase order
        const po = await this.generatePurchaseOrder(item, orderQuantity);

        // Update inventory record
        item.lastOrderedDate = new Date();
        await item.save();

        // Notify manager
        await Notification.create({
          type: "inventory_replenishment",
          recipients: ["inventory_manager"],
          title: `Auto-Replenishment: ${item.materialName}`,
          message: `Purchase order #${po._id} created for ${orderQuantity} ${item.unit} of ${item.materialName}`,
          actionUrl: `/inventory/orders/${po._id}`,
        });
      }

      return { processed: lowStockItems.length };
    } catch (error) {
      console.error("Auto-replenish error:", error);
      throw error;
    }
  }

  // Material Impact Analysis
  static async getMaterialImpact(materialId) {
    const [material, products] = await Promise.all([
      Inventory.findById(materialId),
      Product.find({ material: materialId }),
    ]);

    if (!material) throw new Error("Material not found");

    return {
      material: material.materialName,
      currentStock: material.quantity,
      usedInProducts: products.map((p) => p.name),
      productionImpact:
        material.quantity <= 0
          ? "CRITICAL"
          : material.quantity < material.reorderThreshold
          ? "WARNING"
          : "OK",
      recommendedAction:
        material.quantity <= 0
          ? `Immediate order needed (min ${material.supplier.minimumOrder} units)`
          : material.quantity < material.reorderThreshold
          ? `Consider ordering within ${material.leadTime} days`
          : "Stock level adequate",
    };
  }

  static async generateRecommendations() {
    try {
      const lowStockItems = await Inventory.find({
        $expr: { $lte: ["$quantity", "$reorderThreshold"] },
      }).populate("supplier");

      return lowStockItems.map((item) => ({
        _id: item._id,
        materialName: item.materialName,
        currentStock: item.quantity,
        unit: item.unit,
        recommendedOrder: Math.max(
          item.supplier.minimumOrder,
          Math.ceil((item.optimalStockLevel - item.quantity) * 1.2) // 20% buffer
        ),
        leadTime: item.leadTime,
        priority:
          item.quantity <= 0
            ? "CRITICAL"
            : item.quantity < item.reorderThreshold
            ? "HIGH"
            : "MEDIUM",
        status:
          item.quantity <= 0
            ? "Out of Stock"
            : item.quantity < item.reorderThreshold
            ? "Low Stock"
            : "In Stock",
      }));
    } catch (error) {
      console.error("Error generating recommendations:", error);
      throw error;
    }
  }

  static async generatePurchaseOrder(item, quantity) {
    try {
      // In a real implementation, this would create an actual purchase order
      return {
        _id: new mongoose.Types.ObjectId(),
        materialId: item._id,
        quantity,
        status: "pending",
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("Error generating purchase order:", error);
      throw error;
    }
  }

  static async getMaterialUsageHistory(materialId) {
    try {
      // This would query your database for historical usage data
      const products = await Product.find({ material: materialId }).lean();
      return products.length; // Simplified - real implementation would analyze usage patterns
    } catch (error) {
      console.error("Error getting material usage:", error);
      return 0;
    }
  }
}

module.exports = InventoryAI;
