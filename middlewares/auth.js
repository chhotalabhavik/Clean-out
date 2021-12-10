const passport = require("passport");
const Response = require("../models/Response");
const ROLE = require("../models/Enums/ROLE");
const RESPONSE = require("../models/Enums/RESPONSE");
const handleError = require("../utilities/errorHandler");

const auth = (req) => {
	try {
		passport.authenticate("jwt", (err, user) => {
			if (err) throw err;
			if (user) req.user = user;
		});
	} catch (error) {
		handleError(error);
	}
};

const ifLogin = async (req, res, next) => {
	auth(req);
	if (req.user) return next();
	const message = "Not authorized";
	res.json(new Response(RESPONSE.FAILURE, { message }));
};

const ifNotLogin = async (req, res, next) => {
	auth(req);
	if (!req.user) return next();
	const message = "Already logged in";
	res.json(new Response(RESPONSE.FAILURE, { message }));
};

const ifAdministration = async (req, res, next) => {
	auth(req);
	if (!req.user) {
		const message = "Not authorized";
		return res.json(new Response(RESPONSE.FAILURE, { message }));
	}

	const role = req.user.role;
	if (role === ROLE.COADMIN || role === ROLE.ADMIN) return next();

	const message = "Not authorized";
	return res.json(new Response(RESPONSE.FAILURE, { message }));
};

const ifAdmin = async (req, res, next) => {
	auth(req);
	if (!req.user) {
		const message = "Not authorized";
		return res.json(new Response(RESPONSE.FAILURE, { message }));
	}

	const role = req.user.role;
	if (role === ROLE.ADMIN) return next();

	const message = "Not authorized";
	return res.json(new Response(RESPONSE.FAILURE, { message }));
};

module.exports = {
	ifLogin,
	ifNotLogin,
	ifAdministration,
	ifAdmin,
};
