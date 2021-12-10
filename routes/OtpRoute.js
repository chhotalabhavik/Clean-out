const router = require("express").Router();
const {
	sendResetPasswordOtp,
	verifyResetPasswordOtp,
	sendServiceOrderOtp,
	verifyServiceOrderOtp,
} = require("../controllers/OtpController");

/**
 * POST
 */
// body -> {phone}
// resp -> {success, message, OTP}
router.post("/resetPassword", sendResetPasswordOtp);
// body -> {}
// resp -> {success, message}
router.post("/serviceOrder/:serviceOrderId", sendServiceOrderOtp);

/**
 * PUT
 */
// body -> {phone, OTP}
// resp -> {success, message}
router.put("/resetPassword", verifyResetPasswordOtp);
// body -> {OTP}
// resp -> {success, message}
router.put("/serviceOrder/:serviceOrderId", verifyServiceOrderOtp);

module.exports = router;
