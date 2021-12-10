const mongoose = require("mongoose");
const STATUS = require("./Enums/STATUS");

const PackSchema = mongoose.Schema(
	{
		// sub order id
		orderId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
		shopkeeperId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
		itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
		count: { type: Number, default: Number(1) },
		price: { type: Number, required: true },
		status: { type: STATUS, required: true, default: STATUS.PENDING },
		deliveredDate: { type: String, default: null },
	},
	{ versionKey: false }
);

const PackModel = mongoose.model("OrderItemPack", PackSchema, "OrderItemPack");
PackModel.ensureIndexes().catch((error) => console.log(error));

module.exports = PackModel;
