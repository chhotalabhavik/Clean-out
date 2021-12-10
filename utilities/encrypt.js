const bcrypt = require("bcryptjs");
const handleError = require("./errorHandler");

const encrypt = async (password) => {
	try {
		const salt = bcrypt.genSaltSync(10);
		return bcrypt.hashSync(password, salt);
	} catch (error) {
		handleError(error);
	}
};

module.exports = encrypt;
