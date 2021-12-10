const mongoose = require("mongoose");

const UserModel = require("../models/User");
const AddressModel = require("../models/Address");
const ShopkeeperModel = require("../models/Shopkeeper");
const Response = require("../models/Response");
const ItemModel = require("../models/Item");
const ServiceModel = require("../models/Service");
const WorkerModel = require("../models/Worker");
const WorkerServiceModel = require("../models/WorkerService");
const OrderItemPackModel = require("../models/OrderItemPack");
const ServiceOrderModel = require("../models/ServiceOrder");
const RESPONSE = require("../models/Enums/RESPONSE");
const NOTIFICATION = require("../models/Enums/NOTIFICATION");
const { getOrders } = require("../controllers/UserController");

const bcrypt = require("bcryptjs");
const encrypt = require("../utilities/encrypt");
const handleError = require("../utilities/errorHandler");
const { deleteFiles, useSharp } = require("../utilities/FileHandlers");
const { sendNotifications } = require("../utilities/notifications");

const getShopkeeperById = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const shopkeeper = await ShopkeeperModel.findById(shopkeeperId);
		if (!shopkeeper) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Shopkeeper found";
		res.json(new Response(RESPONSE.SUCCESS, { message, shopkeeper }));
	} catch (error) {
		handleError(error);
	}
};

const getShopkeeperWithOrders = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const [shopkeeperUser, address, shopkeeper] = await Promise.all([
			UserModel.findById(shopkeeperId),
			AddressModel.findById(shopkeeperId),
			ShopkeeperModel.findById(shopkeeperId),
		]);
		if (!shopkeeperUser || !shopkeeper) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const { serviceOrders, itemOrders } = await getOrders(shopkeeperId);
		const message = "Found shopkeeper";
		res.json(
			new Response(RESPONSE.SUCCESS, {
				message,
				shopkeeperUser,
				address,
				shopkeeper,
				serviceOrders,
				itemOrders,
			})
		);
	} catch (error) {
		handleError(error);
	}
};

const getWorkers = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const page = req.query.page;
		const ObjectId = mongoose.Types.ObjectId;

		const pipeline = [
			{ $match: { shopkeeperId: ObjectId(shopkeeperId), isDependent: "true" } },
		];
		const pipelineCount = [...pipeline, { $count: "totalItems" }];
		pipeline.push(
			{ $skip: Number(process.env.LIMIT_WORKERS) * (page - 1) },
			{ $limit: Number(process.env.LIMIT_WORKERS) },
			{
				$lookup: {
					from: "User",
					localField: "_id",
					foreignField: "_id",
					as: "workerUser",
				},
			},
			{ $unwind: "$workerUser" },
			{
				$lookup: {
					from: "Location",
					localField: "_id",
					foreignField: "workerId",
					as: "pincodes",
				},
			},
			{
				$project: {
					workerUser: {
						userName: "$workerUser.userName",
						phone: "$workerUser.phone",
						role: "$workerUser.role",
					},
					worker: {
						shopkeeperId: "$shopkeeperId",
						profilePicture: "$profilePicture",
						proofs: "$proofs",
						pincodes: "$pincodes",
					},
				},
			}
		);

		let [workers, totalItems] = await Promise.all([
			WorkerModel.aggregate(pipeline),
			WorkerModel.aggregate(pipelineCount),
		]);

		if (totalItems && totalItems.length > 0) totalItems = totalItems[0].totalItems;
		else totalItems = 0;

		const message = "Found workers";
		res.json(new Response(RESPONSE.SUCCESS, { message, workers, totalItems }));
	} catch (error) {
		handleError(error);
	}
};

const getRequestedOrders = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const page = req.query.page;
		const ObjectId = mongoose.Types.ObjectId;

		const shopkeeperUser = await UserModel.findById(shopkeeperId);
		if (!shopkeeperUser) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const pipeline = [
			{ $match: { shopkeeperId: ObjectId(shopkeeperId) } },
			{
				$lookup: {
					from: "Item",
					localField: "itemId",
					foreignField: "_id",
					as: "item",
				},
			},
			{ $unwind: "$item" },
			{
				$group: {
					_id: "$orderId",
					shopkeeperId: { $first: "$shopkeeperId" },
					orderItemPacks: { $push: "$$ROOT" },
				},
			},
			{
				$lookup: {
					from: "ItemOrder",
					localField: "_id",
					foreignField: "_id",
					as: "itemOrder",
				},
			},
			{ $unwind: "$itemOrder" },
			{ $group: { _id: "$shopkeeperId", itemOrders: { $push: "$$ROOT" } } },
			{
				$lookup: {
					from: "ServiceOrder",
					localField: "_id",
					foreignField: "shopkeeperId",
					as: "serviceOrders",
				},
			},
		];

		const pipelineCount = [
			...pipeline,
			{
				$project: {
					totalItems: { $sum: [{ $size: "$itemOrders" }, { $size: "$serviceOrders" }] },
				},
			},
		];

		pipeline.push(
			{ $project: { orders: { $concatArrays: ["$itemOrders", "$serviceOrders"] } } },
			{ $unwind: "$orders" },
			{
				$project: {
					_id: 0,
					placedDate: {
						$cond: {
							if: "$orders.itemOrder.placedDate",
							then: "$orders.itemOrder.placedDate",
							else: "$orders.placedDate",
						},
					},
					userId: {
						$cond: {
							if: "$orders.itemOrder.userId",
							then: "$orders.itemOrder.userId",
							else: "$orders.userId",
						},
					},
					orderItemPacks: "$orders.orderItemPacks",
					itemOrder: "$orders.itemOrder",
					serviceOrder: {
						_id: "$orders._id",
						placedDate: "$orders.placedDate",
						deliveredDate: "$orders.deliveredDate",
						status: "$orders.status",
						metaData: "$orders.metaData",
						userId: "$orders.userId",
						workerId: "$orders.workerId",
						serviceId: "$orders.serviceId",
						price: "$orders.price",
						serviceCategory: "$orders.serviceCategory",
					},
				},
			},
			{ $sort: { placedDate: -1 } },
			{ $skip: Number(process.env.LIMIT_ORDERS) * (page - 1) },
			{ $limit: Number(process.env.LIMIT_ORDERS) },
			{
				$lookup: {
					from: "User",
					localField: "userId",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$unwind: {
					path: "$user",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: "Service",
					localField: "serviceOrder.serviceId",
					foreignField: "_id",
					as: "service",
				},
			},
			{
				$unwind: {
					path: "$service",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: "Address",
					localField: "userId",
					foreignField: "_id",
					as: "address",
				},
			},
			{
				$unwind: {
					path: "$address",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: "User",
					localField: "serviceOrder.workerId",
					foreignField: "_id",
					as: "workerUser",
				},
			},
			{
				$unwind: {
					path: "$workerUser",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: "Worker",
					localField: "serviceOrder.workerId",
					foreignField: "_id",
					as: "worker",
				},
			},
			{
				$unwind: {
					path: "$worker",
					preserveNullAndEmptyArrays: true,
				},
			}
		);

		let [orders, totalItems] = await Promise.all([
			OrderItemPackModel.aggregate(pipeline),
			OrderItemPackModel.aggregate(pipelineCount),
		]);

		if (totalItems && totalItems.length > 0) totalItems = totalItems[0].totalItems;
		else totalItems = 0;

		const message = "Found orders";
		res.json(new Response(RESPONSE.SUCCESS, { message, orders, totalItems }));
	} catch (error) {
		handleError(error);
	}
};

const registerShopkeeper = async (req, res) => {
	try {
		const { userName, phone, role } = req.body;
		const { society, area, pincode, city, state } = req.body;
		const { shopName } = req.body;
		const password = await encrypt(req.body.password);
		const files = req.files;
		const proofs = [files.proofs[0].filename];
		if (files.proofs.length > 1) proofs.push(files.proofs[1].filename);

		const user = await UserModel.findOne({ phone });
		if (user) {
			await deleteFiles(proofs, "tempUploads");
			const message = "Registered phone number already";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const _id = mongoose.Types.ObjectId();
		const shopkeeperUser = new UserModel({ _id, userName, phone, password, role });
		const address = new AddressModel({ _id, society, area, pincode, city, state });
		const shopkeeper = new ShopkeeperModel({ _id, shopName, proofs });
		await Promise.all([
			shopkeeperUser.save(),
			address.save(),
			shopkeeper.save(),
			useSharp(proofs),
		]);

		const message = "Registered shopkeeper";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: _id }));
	} catch (error) {
		handleError(error);
	}
};

const addWorker = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const phone = req.body.phone;

		const worker = (
			await UserModel.aggregate([
				{ $match: { phone } },
				{
					$lookup: {
						from: "Worker",
						localField: "_id",
						foreignField: "_id",
						as: "Worker",
					},
				},
				{ $unwind: "$Worker" },
				{ $replaceWith: "$Worker" },
			])
		)[0];

		if (worker.isDependent === "true") {
			const message = "Worker is already under a shopkeeper";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (worker.isDependent === "requested") {
			let message = "Worker is already requested";
			if (worker.shopkeeperId != shopkeeperId) message += " by another shopkeeper";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		worker.shopkeeperId = shopkeeperId;
		worker.isDependent = "requested";
		await WorkerModel.findByIdAndUpdate(worker._id, worker);

		const message = "Sent request";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const updateShopkeeper = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const { userName, phone, password, newPassword } = req.body;
		const { society, area, pincode, city, state } = req.body;
		const { shopName, isAdmin } = req.body;
		const files = req.files;
		const proofs = [];

		if (files.proofs) {
			proofs.push(files.proofs[0].filename);
			if (files.proofs.length > 1) proofs.push(files.proofs[1].filename);
		}

		const [shopkeeperUser, shopkeeper] = await Promise.all([
			UserModel.findById(shopkeeperId),
			ShopkeeperModel.findById(shopkeeperId),
		]);
		if (!shopkeeperUser || !shopkeeper) {
			if (files.proofs) await deleteFiles(proofs, "tempUploads");
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const isMatch = await bcrypt.compare(password || "", shopkeeperUser.password);
		if (!isMatch && !isAdmin) {
			if (files.proofs) await deleteFiles(proofs, "tempUploads");
			const message = "Incorrect password";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		shopkeeperUser.userName = userName;
		shopkeeperUser.phone = phone;
		if (newPassword) shopkeeperUser.password = await encrypt(newPassword);
		shopkeeper.shopName = shopName;

		if (files.proofs) {
			await Promise.all([useSharp(proofs), deleteFiles(shopkeeper.proofs)]);
			shopkeeper.proofs = proofs;
		}

		shopkeeper.isVerified = false;
		await Promise.all([
			shopkeeperUser.save(),
			AddressModel.findByIdAndUpdate(shopkeeperId, { society, area, pincode, city, state }),
			shopkeeper.save(),
		]);

		const message = "Updated shopkeeper";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const removeShopkeeper = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const [shopkeeperUser, shopkeeper] = await Promise.all([
			UserModel.findById(shopkeeperId),
			ShopkeeperModel.findById(shopkeeperId),
		]);
		if (!shopkeeperUser || !shopkeeper) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const workers = await WorkerModel.find({ shopkeeperId });

		await Promise.all([
			shopkeeper.delete(),
			shopkeeperUser.delete(),
			AddressModel.findByIdAndDelete(shopkeeperId),
			deleteFiles(shopkeeper.proofs),
			ItemModel.deleteMany({ shopkeeperId }),
			ServiceModel.deleteMany({ serviceProviderId: shopkeeperId }),
			Promise.all(
				workers.map((worker) => {
					worker.shopkeeperId = null;
					worker.isDependent = "false";
					return Promise.all([
						worker.save(),
						WorkerServiceModel.deleteMany({ workerId: worker._id }),
					]);
				})
			),
		]);

		const message = "Deleted shopkeeper";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const removeWorkerFromShop = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const workerId = req.query.workerId;

		const [workerUser, worker, shopkeeperUser] = await Promise.all([
			UserModel.findById(workerId),
			WorkerModel.findById(workerId),
			UserModel.findById(shopkeeperId),
		]);

		if (!shopkeeperUser) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (!workerUser || !worker) {
			const message = "Worker not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		worker.shopkeeperId = null;
		worker.isDependent = "false";
		await worker.save();

		const services = await ServiceModel.find({ serviceProviderId: workerId });
		await Promise.all(
			services.map((service) =>
				new WorkerServiceModel({ workerId, serviceId: service._id }).save()
			)
		);

		let message = "You have been removed from shop";
		sendNotifications(message, [workerUser.phone], NOTIFICATION.REMOVED_FROM_SHOP);

		message = `${workerUser.userName} removed from shop`;
		sendNotifications(message, [shopkeeperUser.phone], NOTIFICATION.REMOVED_FROM_SHOP);
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getShopkeeperById,
	getShopkeeperWithOrders,
	getWorkers,
	getRequestedOrders,
	registerShopkeeper,
	addWorker,
	updateShopkeeper,
	removeShopkeeper,
	removeWorkerFromShop,
};
