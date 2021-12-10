const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const WorkerModel = require("../models/Worker");
const LocationModel = require("../models/Location");
const UserModel = require("../models/User");
const AddressModel = require("../models/Address");
const ShopkeeperModel = require("../models/Shopkeeper");
const ServiceModel = require("../models/Service");
const ServiceOrderModel = require("../models/ServiceOrder");
const WorkerServiceModel = require("../models/WorkerService");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");
const NOTIFICATION = require("../models/Enums/NOTIFICATION");
const { getOrders } = require("./UserController");

const encrypt = require("../utilities/encrypt");
const handleError = require("../utilities/errorHandler");
const { stringToArray, arrayToString } = require("../utilities/formatter");
const { deleteFiles, useSharp } = require("../utilities/FileHandlers");
const { sendNotifications } = require("../utilities/notifications");

const getWorkerWithShopkeeperById = async (workerId) => {
	try {
		const workerUser = await UserModel.findById(workerId);
		if (!workerUser) {
			const message = "Worker not found";
			return { info: new Response(RESPONSE.FAILURE, { message }) };
		}

		const worker = await WorkerModel.findById(workerId);
		if (worker.isDependent == "true") {
			const shopkeeperId = worker.shopkeeperId;
			const shopkeeperUser = await UserModel.findById(shopkeeperId);
			if (!shopkeeperUser) {
				const message = `Shopkeeper not found`;
				return { info: new Response(RESPONSE.FAILURE, { message }) };
			}
			return { workerUser, shopkeeperUser };
		}
		return { workerUser };
	} catch (error) {
		handleError(error);
	}
};

const getWorkerById = async (req, res) => {
	try {
		const workerId = req.params.workerId;
		const [workerUser, address, worker, pincodes] = await Promise.all([
			UserModel.findById(workerId),
			AddressModel.findById(workerId),
			WorkerModel.findById(workerId),
			LocationModel.find({ workerId }),
		]);
		if (!workerUser || !worker || !address) {
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Worker found";
		res.json(
			new Response(RESPONSE.SUCCESS, {
				message,
				workerUser,
				address,
				worker: {
					...worker._doc,
					pincodes: arrayToString(pincodes.map((pincode) => pincode.pincode)),
				},
			})
		);
	} catch (error) {
		handleError(error);
	}
};

const getWorkerWithOrders = async (req, res) => {
	try {
		const workerId = req.params.workerId;
		const [workerUser, address, worker, pincodes] = await Promise.all([
			UserModel.findById(workerId),
			AddressModel.findById(workerId),
			WorkerModel.findById(workerId),
			LocationModel.find({ workerId }),
		]);

		if (!workerUser || !worker) {
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		let shopkeeperUser = null;
		if (worker.isDependent === "true") {
			shopkeeperUser = await UserModel.findById(worker.shopkeeperId);
		}

		worker._doc.pincodes = arrayToString(pincodes.map((pincode) => pincode.pincode));
		const { serviceOrders, itemOrders } = await getOrders(workerId);
		const message = "Found worker";
		res.json(
			new Response(RESPONSE.SUCCESS, {
				message,
				workerUser,
				address,
				worker,
				serviceOrders,
				itemOrders,
				shopkeeperUser,
			})
		);
	} catch (error) {
		handleError(error);
	}
};

const getRequestedOrders = async (req, res) => {
	try {
		const workerId = req.params.workerId;
		const page = req.query.page;

		const workerUser = await UserModel.findById(workerId);
		if (!workerUser) {
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const pipeline = [{ $match: { workerId: mongoose.Types.ObjectId(workerId) } }];
		const pipelineCount = [...pipeline, { $count: "totalItems" }];
		pipeline.push(
			{ $sort: { placedDate: -1 } },
			{ $skip: Number(process.env.LIMIT_ORDERS) * (page - 1) },
			{ $limit: Number(process.env.LIMIT_ORDERS) },
			{ $project: { serviceOrder: "$$ROOT" } },
			{
				$lookup: {
					from: "Service",
					localField: "serviceOrder.serviceId",
					foreignField: "_id",
					as: "service",
				},
			},
			{ $unwind: "$service" },
			{
				$lookup: {
					from: "User",
					localField: "serviceOrder.userId",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{
				$lookup: {
					from: "Address",
					localField: "serviceOrder.userId",
					foreignField: "_id",
					as: "address",
				},
			},
			{ $unwind: "$address" }
		);

		let [orders, totalItems] = await Promise.all([
			ServiceOrderModel.aggregate(pipeline),
			ServiceOrderModel.aggregate(pipelineCount),
		]);

		if (totalItems && totalItems.length) totalItems = totalItems[0].totalItems;
		else totalItems = 0;

		const message = "Orders found";
		res.json(new Response(RESPONSE.SUCCESS, { message, orders, totalItems }));
	} catch (error) {
		handleError(error);
	}
};

const getShopkeeperRequest = async (req, res) => {
	try {
		const workerId = req.params.workerId;
		const worker = await WorkerModel.findById(workerId);
		if (!worker) {
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (worker.isDependent !== "requested") {
			const message = "Request not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const shopkeeperId = worker.shopkeeperId;
		const [shopkeeperUser, shopkeeper] = await Promise.all([
			UserModel.findById(shopkeeperId),
			ShopkeeperModel.findById(shopkeeperId),
		]);

		if (!shopkeeperUser) {
			worker.shopkeeperId = null;
			worker.isDependent = "false";
			await worker.save();

			const message = "Request not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Request found";
		const request = {
			shopkeeperId,
			shopkeeperName: shopkeeperUser.userName,
			phone: shopkeeperUser.phone,
			shopName: shopkeeper.shopName,
		};
		return res.json(new Response(RESPONSE.SUCCESS, { message, request }));
	} catch (error) {
		handleError(error);
	}
};

const registerWorker = async (req, res) => {
	try {
		const { userName, phone, role } = req.body;
		const { society, area, pincode, city, state } = req.body;
		const password = await encrypt(req.body.password);
		const pincodes = Array.from(new Set(stringToArray(req.body.pincodes)));
		const files = req.files;
		const profilePicture = files.profilePicture[0].filename;
		const proofs = [files.proofs[0].filename];
		if (files.proofs.length > 1) proofs.push(files.proofs[1].filename);

		const user = await UserModel.findOne({ phone });
		if (user) {
			await Promise.all([
				deleteFiles(proofs, "tempUploads"),
				deleteFiles([profilePicture], "tempUploads"),
			]);
			const message = "Registered phone number already";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const _id = mongoose.Types.ObjectId();
		const workerUser = new UserModel({ _id, userName, phone, password, role });
		const address = new AddressModel({ _id, society, area, pincode, city, state });
		const worker = new WorkerModel({ _id, profilePicture, proofs });
		const locations = pincodes.map((pincode) => new LocationModel({ workerId: _id, pincode }));

		await Promise.all([
			worker.save(),
			address.save(),
			workerUser.save(),
			useSharp(proofs),
			useSharp([profilePicture]),
			LocationModel.insertMany(locations),
		]);

		const message = "Registered worker";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: _id }));
	} catch (error) {
		handleError(error);
	}
};

const setShopkeeperResponse = async (req, res) => {
	try {
		const workerId = req.params.workerId;
		const response = req.body.response;

		const worker = await WorkerModel.findById(workerId);
		if (!worker) {
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (worker.isDependent !== "requested") {
			const message = "Cannot accepted";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const [workerUser, shopkeeperUser] = await Promise.all([
			UserModel.findById(workerId),
			UserModel.findById(worker.shopkeeperId),
		]);
		if (!shopkeeperUser) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (!response) {
			worker.shopkeeperId = null;
			worker.isDependent = "false";

			let message = `${workerUser.userName} has rejected your request.`;
			sendNotifications(message, [shopkeeperUser.phone], NOTIFICATION.REQUEST_REJECTED);
			await worker.save();

			message = "Rejected request";
			return res.json(new Response(RESPONSE.SUCCESS, { message }));
		}

		await WorkerServiceModel.deleteMany({ workerId });

		const services = await ServiceModel.find({ serviceProviderId: worker.shopkeeperId });
		await Promise.all(
			services.map((service) =>
				new WorkerServiceModel({ workerId, serviceId: service._id }).save()
			)
		);

		worker.isDependent = "true";
		await worker.save();

		let message = `${workerUser.userName} has accepted your request`;
		sendNotifications(message, [shopkeeperUser.phone], NOTIFICATION.REQUEST_ACCEPTED);

		message = "Request accepted";
		return res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const updateWorker = async (req, res) => {
	try {
		const workerId = req.params.workerId;
		const { userName, phone, password, newPassword } = req.body;
		const { society, area, pincode, city, state } = req.body;
		const { isAdmin } = req.body;
		let pincodes = Array.from(new Set(stringToArray(req.body.pincodes)));
		const files = req.files;
		let profilePicture = null,
			proofs = null;

		if (files.profilePicture) profilePicture = files.profilePicture[0].filename;
		if (files.proofs) {
			proofs = [files.proofs[0].filename];
			if (files.proofs.length > 1) proofs.push(files.proofs[1].filename);
		}

		const [workerUser, worker] = await Promise.all([
			UserModel.findById(workerId),
			WorkerModel.findById(workerId),
		]);
		if (!workerUser || !worker) {
			if (profilePicture) await deleteFiles([profilePicture], "tempUploads");
			if (proofs) await deleteFiles(proofs, "tempUploads");
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const isMatch = await bcrypt.compare(password || "", workerUser.password);
		if (!isMatch && !isAdmin) {
			if (profilePicture) await deleteFiles([profilePicture], "tempUploads");
			if (proofs) await deleteFiles(proofs, "tempUploads");
			const message = "Incorrect password";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		workerUser.userName = userName;
		workerUser.phone = phone;
		if (newPassword) workerUser.password = await encrypt(newPassword);

		worker.isVerified = false;
		if (profilePicture) {
			await Promise.all([useSharp([profilePicture]), deleteFiles([worker.profilePicture])]);
			worker.profilePicture = profilePicture;
		}
		if (proofs) {
			await Promise.all([useSharp(proofs), deleteFiles(worker.proofs)]);
			worker.proofs = proofs;
		}

		let oldLocations = await LocationModel.find({ workerId });
		let common = oldLocations
			.filter((location) => pincodes.includes(location.pincode))
			.map((location) => location.pincode);

		pincodes = pincodes.filter((pincode) => !common.includes(pincode));
		oldLocations = oldLocations.filter((location) => !common.includes(location.pincode));
		const locations = pincodes.map((pincode) => new LocationModel({ workerId, pincode }));

		await Promise.all([
			worker.save(),
			workerUser.save(),
			AddressModel.findByIdAndUpdate(workerId, { society, area, pincode, city, state }),
			LocationModel.insertMany(locations),
			Promise.all(
				oldLocations.map((oldLocation) => LocationModel.findByIdAndDelete(oldLocation._id))
			),
		]);

		const message = "Updated worker";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const removeWorker = async (req, res) => {
	try {
		const workerId = req.params.workerId;
		const [workerUser, worker] = await Promise.all([
			UserModel.findById(workerId),
			WorkerModel.findById(workerId),
		]);
		if (!workerUser || !worker) {
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		await Promise.all([
			worker.delete(),
			workerUser.delete(),
			AddressModel.findByIdAndDelete(workerId),
			deleteFiles(worker.proofs),
			deleteFiles([worker.profilePicture]),
			LocationModel.deleteMany({ workerId }),
			ServiceModel.deleteMany({ serviceProviderId: workerId }),
			WorkerServiceModel.deleteMany({ workerId }),
		]);

		const message = "Deleted worker";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const leaveShop = async (req, res) => {
	try {
		const workerId = req.params.workerId;
		const [workerUser, worker] = await Promise.all([
			UserModel.findById(workerId),
			WorkerModel.findById(workerId),
		]);

		if (!workerUser) {
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (worker.isDependent !== "true") {
			const message = "Invalid request";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const shopkeeperUser = await UserModel.findById(worker.shopkeeperId);
		let message = `${workerUser.userName} has left the shop.`;
		sendNotifications(message, [shopkeeperUser.phone], NOTIFICATION.LEFT_SHOP);

		worker.shopkeeperId = null;
		worker.isDependent = "false";
		const services = await ServiceModel.find({ serviceProviderId: workerId });
		await Promise.all([
			worker.save(),
			Promise.all(
				services.map((service) =>
					new WorkerServiceModel({ workerId, serviceId: service._id }).save()
				)
			),
		]);

		message = "Left shop";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getWorkerById,
	getWorkerWithOrders,
	getWorkerWithShopkeeperById,
	getRequestedOrders,
	getShopkeeperRequest,
	registerWorker,
	setShopkeeperResponse,
	updateWorker,
	removeWorker,
	leaveShop,
};
