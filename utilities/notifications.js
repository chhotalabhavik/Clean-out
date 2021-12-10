const nodemailer = require("nodemailer");

const handleError = require("./errorHandler");
const { arrayToString } = require("./formatter");

const getOtp = () => {
	let number = "";
	while (number.length != 6) number = String(Math.floor(Math.random() * 1e6));
	return number;
};

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_ACCOUNT,
		pass: process.env.EMAIL_PASSWORD,
	},
});

const sendNotifications = async (message, targets, purpose) => {
	console.log("message", message);
	console.log("targets", targets);
	console.log("purpose", purpose);
	// const mailOptions = {
	// 	from: process.env.EMAIL_ACCOUNT,
	// 	to: arrayToString(targets),
	// 	subject: `${purpose} - Clean Out`,
	// 	html: `<h3>${message}</h3>`,
	// };

	// transporter.sendMail(mailOptions, (error, info) => {
	// 	if (error) handleError(error);
	// });
};

module.exports = { getOtp, sendNotifications };
