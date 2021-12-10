const mongoose = require("mongoose");

const LocationSchema = mongoose.Schema(
	{
		workerId: { type: mongoose.Schema.Types.ObjectId, required: true },
		pincode: { type: String, required: true },
	},
	{ versionKey: false }
);

LocationSchema.index({ workerId: 1, pincode: 1 }, { unique: true });
LocationSchema.index({ pincode: 1, workerId: 1 }, { unique: true });

const LocationModel = mongoose.model("Location", LocationSchema, "Location");
LocationModel.ensureIndexes().catch((error) => console.log(error));

module.exports = LocationModel;
