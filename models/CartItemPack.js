const mongoose = require("mongoose");

const PackSchema = mongoose.Schema(
	{
		//cartItemPackId
		userId: { type: mongoose.Schema.Types.ObjectId, required: true },
		itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
		count: { type: Number, required: true, default: 0 },
	},
	{ versionKey: false }
);

PackSchema.index({ userId: 1, itemId: 1 }, { unique: true });

const PackModel = mongoose.model("CartItemPack", PackSchema, "CartItemPack");
PackModel.ensureIndexes().catch((error) => console.log(error));

module.exports = PackModel;
