const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

module.exports = { getJwt, refreshToken };

function getJwt(payload) {
	return new Promise((resolve, reject) => {
		jwt.sign(payload, process.env.SESSION_SECRET, { expiresIn: "1d" }, (err, token) => {
			if (err) reject(err);
			else resolve(token);
		});
	});
}

async function refreshToken(token) {
	return new Promise(async (resolve, reject) => {
		try {
			const decodedJwt = jwt.decode(token);
			if (!decodedJwt) reject("Invalid token");
			const user = await UserModel.findById(decodedJwt._id);
			const newToken = await getJwt({ _id: user._id, role: user.role });
			resolve(newToken);
		} catch (error) {
			reject(error);
		}
	});
}
