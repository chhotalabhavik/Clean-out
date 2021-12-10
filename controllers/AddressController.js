const AddressModel = require("../models/Address");

const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");

const handleError = require("../utilities/errorHandler");

const getAddressById = async (req, res) => {
	try {
		const userId = req.params.userId;
		const address = await AddressModel.findById(userId);
		if (!address) {
			const message = "Address not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Address found";
		res.json(new Response(RESPONSE.SUCCESS, { message, address }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = { getAddressById };
