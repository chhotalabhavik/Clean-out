const router = require("express").Router();

const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");
const handleError = require("../utilities/errorHandler");
const { refreshToken } = require("../utilities/jwt");

/**
 * GET
 */
// body -> {q:token}
// resp -> {success, message, newToken}
router.get("/refreshToken", async (req, res) => {
	try {
		const token = req.query.token;
		const newToken = await refreshToken(token);
		const message = "Token generated";
		res.json(new Response(RESPONSE.SUCCESS, { message, newToken }));
	} catch (error) {
		handleError(error);
	}
});

module.exports = router;
