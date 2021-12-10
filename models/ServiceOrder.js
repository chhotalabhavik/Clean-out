const mongoose = require("mongoose");
const moment = require("moment");
const STATUS = require("./Enums/STATUS");

const OrderSchema = mongoose.Schema(
	{
		// order id
		userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
		workerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
		shopkeeperId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
		serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
		placedDate: {
			type: String,
			required: true,
			default: moment().format(process.env.DATE_FORMAT),
			index: true,
		},
		deliveredDate: { type: String, default: null },
		price: { type: Number, required: true },
		status: { type: STATUS, required: true, default: STATUS.PENDING },
		serviceCategory: { type: String, required: true },
		metaData: { type: Object, default: null },
		OTP: { type: String, default: null },
	},
	{ versionKey: false }
);

const OrderModel = mongoose.model("ServiceOrder", OrderSchema, "ServiceOrder");
OrderModel.ensureIndexes().catch((error) => console.log(error));

module.exports = OrderModel;
