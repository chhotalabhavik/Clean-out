const UserModel = require("../models/User");
const ServiceOrderModel = require("../models/ServiceOrder");
const Response = require("../models/Response");
const STATUS = require("../models/Enums/STATUS");
const RESPONSE = require("../models/Enums/RESPONSE");
const NOTIFICATION = require("../models/Enums/NOTIFICATION");
const { getWorkerWithShopkeeperById } = require("./WorkerController");

const handleError = require("../utilities/errorHandler");
const { getOtp, sendNotifications } = require("../utilities/notifications");

const sendResetPasswordOtp = async (req, res) => {
	try {
		const phone = req.body.phone;
		const user = await UserModel.findOne({ phone });
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const OTP = (user.OTP = getOtp());
		sendNotifications(OTP, [phone], NOTIFICATION.RESET_PASSWORD);
		await user.save();

		const message = "Sent OTP";
		res.json(new Response(RESPONSE.SUCCESS, { message, OTP }));
	} catch (error) {
		handleError(error);
	}
};

const verifyResetPasswordOtp = async (req, res) => {
	try {
		const { phone, OTP } = req.body;
		const user = await UserModel.findOne({ phone });
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (user.OTP != OTP) {
			const message = "Incorrect OTP";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		user.OTP = null;
		await user.save();

		const message = "Correct OTP";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const sendServiceOrderOtp = async (req, res) => {
	try {
		const orderId = req.params.serviceOrderId;
		const order = await ServiceOrderModel.findById(orderId);
		if (!order) {
			const message = "Service order not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}
		if (order.status != STATUS.PENDING) {
			const message = "Cannot send OTP";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const userId = order.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const OTP = (order.OTP = getOtp());
		await order.save();
		sendNotifications(OTP, [user.phone], NOTIFICATION.VERIFY_WORKER);

		const message = "Sent OTP";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const verifyServiceOrderOtp = async (req, res) => {
	try {
		const orderId = req.params.serviceOrderId;
		const order = await ServiceOrderModel.findById(orderId);
		if (!order) {
			const message = "Service order not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}
		if (order.status != STATUS.PENDING) {
			const message = "Cannot verify OTP";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}
		if (order.OTP != req.body.OTP) {
			const message = "Incorrect OTP";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const userId = order.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const workerId = order.workerId;
		const { workerUser, shopkeeperUser, info } = await getWorkerWithShopkeeperById(workerId);
		if (info) return res.json(info);

		const targets = [user.phone, workerUser.phone];
		if (shopkeeperUser) targets.push(shopkeeperUser.phone);

		order.OTP = null;
		order.status = STATUS.BEING_SERVED;
		let message = "Service order is being served";
		sendNotifications(message, targets, NOTIFICATION.VERIFIED_WORKER);
		await order.save();

		message = "Correct OTP";
		return res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	sendResetPasswordOtp,
	verifyResetPasswordOtp,
	sendServiceOrderOtp,
	verifyServiceOrderOtp,
};
