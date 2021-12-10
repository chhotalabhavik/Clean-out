const mongoose = require("mongoose");
const moment = require("moment");

const OrderSchema = mongoose.Schema(
	{
		// order id
		userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
		placedDate: {
			type: String,
			required: true,
			default: moment().format(process.env.DATE_FORMAT),
		},
		price: { type: Number, required: true, default: Number(0) },
	},
	{ versionKey: false }
);

const OrderModel = mongoose.model("ItemOrder", OrderSchema, "ItemOrder");
OrderModel.ensureIndexes().catch((error) => console.log(error));

module.exports = OrderModel;
