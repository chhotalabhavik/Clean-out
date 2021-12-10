const mongoose = require("mongoose");

const AddressSchema = mongoose.Schema(
	{
		// user id
		society: { type: String, required: true },
		area: { type: String, required: true },
		pincode: { type: String, required: true, index: true },
		city: { type: String, required: true },
		state: { type: String, required: true },
	},
	{ versionKey: false }
);

const AddressModel = mongoose.model("Address", AddressSchema, "Address");
AddressModel.ensureIndexes().catch((error) => console.log(error));

module.exports = AddressModel;
