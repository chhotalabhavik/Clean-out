const passport = require("passport");
const bcrypt = require("bcryptjs");

const UserModel = require("../models/User");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");

const { getJwt } = require("../utilities/jwt");
const handleError = require("../utilities/errorHandler");

const loginUser = async (req, res) => {
	try {
		const { phone, password } = req.body;
		if (!phone || !password) {
			const message = "Missing credentials";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const user = await UserModel.findOne({ phone });
		if (!user) {
			const message = "Invalid contact number";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (isMatch) {
			const payload = { _id: user._id, role: user.role };
			const token = await getJwt(payload);
			const message = "Logged In";
			res.json(new Response(RESPONSE.SUCCESS, { message, user: payload, token }));
		} else {
			const message = "Invalid password";
			res.json(new Response(RESPONSE.FAILURE, { message }));
		}
	} catch (error) {
		handleError(error);
	}
};

const logoutUser = (req, res) => {
	req.logout();

	const message = "Logged out";
	res.json(new Response(RESPONSE.SUCCESS, { message }));
};

module.exports = {
	loginUser,
	logoutUser,
};
