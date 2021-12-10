const router = require("express").Router();
const WorkerModel = require("../models/Worker");
const { sendResetPasswordOtp } = require("../controllers/OtpController");

router.get("", async (req, res) => {
	console.log(req.query);
});

module.exports = router;
