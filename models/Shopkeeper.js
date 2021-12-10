const mongoose = require("mongoose");

const ShopkeeperSchema = mongoose.Schema(
	{
		// shopkeeper id
		shopName: { type: String, required: true },
		proofs: { type: mongoose.Schema.Types.Array, required: true },
		isVerified: { type: Boolean, required: true, default: false },
	},
	{ versionKey: false }
);

const ShopkeeperModel = mongoose.model("Shopkeeper", ShopkeeperSchema, "Shopkeeper");
module.exports = ShopkeeperModel;
