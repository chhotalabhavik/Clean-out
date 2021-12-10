const mongoose = require("mongoose");

const ItemSchema = mongoose.Schema(
	{
		// item id
		shopkeeperId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
		itemName: { type: String, required: true },
		price: { type: Number, required: true },
		orderedCount: { type: Number, required: true, default: 0 },
		itemImage: { type: String, required: true },
		isAvailable: { type: Boolean, required: true, default: true },
		ratingValue: { type: Number, required: true, default: process.env.DEFAULT_RATING },
		ratingCount: { type: Number, required: true, default: 0 },
		description: { type: String, default: "" },
	},
	{ versionKey: false }
);

ItemSchema.index({ price: 1 });
ItemSchema.index({ orderedCount: -1 });
ItemSchema.index({ ratingValue: -1 });
ItemSchema.index({ itemName: "text", description: "text" });

const ItemModel = mongoose.model("Item", ItemSchema, "Item");
ItemModel.ensureIndexes().catch((error) => console.log(error));

module.exports = ItemModel;
