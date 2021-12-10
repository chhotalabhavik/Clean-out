const moment = require("moment");

const UserModel = require("../models/User");
const AddressModel = require("../models/Address");
const ServiceOrderModel = require("../models/ServiceOrder");
const ServiceModel = require("../models/Service");
const WorkerModel = require("../models/Worker");
const WorkerServiceModel = require("../models/WorkerService");
const Response = require("../models/Response");
const ROLE = require("../models/Enums/ROLE");
const STATUS = require("../models/Enums/STATUS");
const RESPONSE = require("../models/Enums/RESPONSE");
const NOTIFICATION = require("../models/Enums/NOTIFICATION");

const handleError = require("../utilities/errorHandler");
const { sendNotifications } = require("../utilities/notifications");
const { getWorkerWithShopkeeperById } = require("./WorkerController");

const getServiceOrder = async (req, res) => {
	try {
		const orderId = req.params.serviceOrderId;
		const order = await ServiceOrderModel.findById(orderId);
		if (!order) {
			const message = "Service order not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const workerId = order.workerId;
		const serviceId = order.serviceId;
		const [user, address, workerUser, worker, service, [workerService]] = await Promise.all([
			UserModel.findById(order.userId),
			AddressModel.findById(order.userId),
			UserModel.findById(workerId),
			WorkerModel.findById(workerId),
			ServiceModel.findById(serviceId),
			WorkerServiceModel.find({ workerId, serviceId }),
		]);

		const message = "Found service order";
		res.json(
			new Response(RESPONSE.SUCCESS, {
				message,
				serviceOrder: order,
				user,
				address,
				workerUser,
				worker,
				service,
				workerService,
			})
		);
	} catch (error) {
		handleError(error);
	}
};

const doneOrder = async (req, res) => {
	try {
		const orderId = req.params.serviceOrderId;
		const order = await ServiceOrderModel.findById(orderId);
		if (!order) {
			const message = "Service order not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}
		if (order.status != STATUS.BEING_SERVED) {
			const message = "Cannot complete order";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const userId = order.userId;
		const workerId = order.workerId;
		const [user, { workerUser, shopkeeperUser, info }] = await Promise.all([
			UserModel.findById(userId),
			getWorkerWithShopkeeperById(workerId),
		]);

		let message = null;
		if (!user) message = "User not found";

		if (message) res.json(new Response(RESPONSE.FAILURE, { message }));
		if (info) return res.json(info);

		const targets = [user.phone, workerUser.phone];
		if (shopkeeperUser) targets.push(shopkeeperUser.phone);

		order.status = STATUS.DELIVERED;
		order.deliveredDate = moment().format(process.env.DATE_FORMAT);
		await order.save();

		message = `Order delivered with total price : ${order.price}`;
		sendNotifications(message, targets, NOTIFICATION.DELIVERED_ORDER);

		message = "Delivered order";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const cancelOrder = async (req, res) => {
	try {
		const orderId = req.params.serviceOrderId;
		const order = await ServiceOrderModel.findById(orderId);
		if (!order) {
			const message = "Service order not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const userId = order.userId;
		const workerId = order.workerId;
		const serviceId = order.serviceId;
		const [user, { workerUser, shopkeeperUser, info }, workerService] = await Promise.all([
			UserModel.findById(userId),
			getWorkerWithShopkeeperById(workerId),
			WorkerServiceModel.findOne({ workerId, serviceId }),
		]);
		if (info) return res.json(info);

		const targets = [user.phone, workerUser.phone];
		if (shopkeeperUser) targets.push(shopkeeperUser.phone);

		let message = `Order cancelled with total price : ${order.price}`;
		sendNotifications(message, targets, NOTIFICATION.CANCEL_ORDER);

		order.status = STATUS.CANCELLED;
		workerService.orderedCount--;
		await Promise.all([order.save(), workerService.save()]);

		message = "Cancelled order";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const replaceOrder = async (req, res) => {
	try {
		const orderId = req.params.serviceOrderId;
		const order = await ServiceOrderModel.findById(orderId);
		if (!order) {
			const message = "Service order not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const userId = order.userId;
		const workerId = order.workerId;
		const serviceId = order.serviceId;
		const [
			user,
			{ workerUser, shopkeeperUser, info },
			service,
			workerService,
		] = await Promise.all([
			UserModel.findById(userId),
			getWorkerWithShopkeeperById(workerId),
			ServiceModel.findById(serviceId),
			WorkerServiceModel.findOne({ workerId, serviceId }),
		]);

		let message = null;
		if (!user) message = "User not found";
		else if (!service) message = "Service not found";
		else if (!workerUser) message = "Worker not found";
		else if (!workerService) message = "Service for worker not found";

		if (message) return res.json(new Response(RESPONSE.FAILURE, { message }));
		if (info) return res.json(info);

		const newOrder = new ServiceOrderModel();
		newOrder.userId = userId;
		newOrder.price = order.price;
		newOrder.workerId = workerId;
		newOrder.serviceId = serviceId;
		newOrder.serviceCategory = order.serviceCategory;
		newOrder.metaData = order.metaData;
		newOrder.shopkeeperId = order.shopkeeperId;
		workerService.orderedCount++;
		await Promise.all([newOrder.save(), workerService.save()]);

		const targets = [user.phone, workerUser.phone];
		if (shopkeeperUser) targets.push(shopkeeperUser.phone);

		message = `Order placed with total price : ${order.price}`;
		sendNotifications(message, targets, NOTIFICATION.CANCEL_ORDER);

		message = "Replaced order";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: newOrder._id }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getServiceOrder,
	doneOrder,
	cancelOrder,
	replaceOrder,
};
