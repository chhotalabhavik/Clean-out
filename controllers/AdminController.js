const UserModel = require("../models/User");
const AddressModel = require("../models/Address");
const ShopkeeperModel = require("../models/Shopkeeper");
const ItemModel = require("../models/Item");
const LocationModel = require("../models/Location");
const ServiceModel = require("../models/Service");
const WorkerModel = require("../models/Worker");
const WorkerServiceModel = require("../models/WorkerService");
const OrderItemPackModel = require("../models/OrderItemPack");
const ItemOrderModel = require("../models/ItemOrder");
const ServiceOrderModel = require("../models/ServiceOrder");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");
const handleError = require("../utilities/errorHandler");
const ROLE = require("../models/Enums/ROLE");

module.exports = { getInitialData, getUsers, verifyServiceProvider, toggleCoadmin };

async function getInitialData(req, res) {
	try {
		const [
			totalUsers,
			totalWorkers,
			totalShopkeepers,
			totalItemOrders,
			totalServiceOrders,
		] = await Promise.all([
			UserModel.find().countDocuments(),
			WorkerModel.find().countDocuments(),
			ShopkeeperModel.find().countDocuments(),
			ItemOrderModel.find().countDocuments(),
			ServiceOrderModel.find().countDocuments(),
		]);

		const message = "Found counts";
		res.json(
			new Response(RESPONSE.SUCCESS, {
				message,
				totalUsers,
				totalWorkers,
				totalShopkeepers,
				totalItemOrders,
				totalServiceOrders,
			})
		);
	} catch (error) {
		handleError(error);
	}
}

async function getUsers(req, res) {
	try {
		const { page, search, searchBy, searchFor, verification } = req.query;
		let users, totalItems;

		const workerObj = {
			$lookup: {
				from: "Worker",
				localField: "_id",
				foreignField: "_id",
				as: "worker",
			},
		};

		const shopkeeperObj = {
			$lookup: {
				from: "Shopkeeper",
				localField: "_id",
				foreignField: "_id",
				as: "shopkeeper",
			},
		};

		const workerVerificationObj = {
			$match: { "worker.isVerified": verification === "verified" ? true : false },
		};

		const shopkeeperVerificationObj = {
			$match: { "shopkeeper.isVerified": verification === "verified" ? true : false },
		};

		const countObj = { $count: "totalItems" };

		if (searchBy === "phone") {
			const pipeline = [{ $match: { phone: search } }];
			const pipelineCount = [...pipeline];

			pipeline.push(
				{ $skip: Number(process.env.LIMIT_ADMIN) * (page - 1) },
				{ $limit: Number(process.env.LIMIT_ADMIN) },
				{
					$lookup: {
						from: "Address",
						localField: "_id",
						foreignField: "_id",
						as: "address",
					},
				},
				{ $unwind: "$address" }
			);

			if (searchFor === "worker") {
				pipeline[0].$match.role = ROLE.WORKER;
				pipelineCount[0].$match.role = ROLE.WORKER;

				if (verification === "any") {
					pipeline.push(workerObj, { $unwind: "$worker" });
				} else {
					pipeline.splice(1, 0, workerObj, { $unwind: "$worker" });
					pipeline.splice(2, 0, workerVerificationObj);
					pipelineCount.push(workerObj, { $unwind: "$worker" }, workerVerificationObj);
				}

				pipeline.push(
					{
						$lookup: {
							from: "User",
							localField: "worker.shopkeeperId",
							foreignField: "_id",
							as: "shopkeeperUser",
						},
					},
					{
						$unwind: {
							path: "$shopkeeperUser",
							preserveNullAndEmptyArrays: true,
						},
					}
				);
			} else if (searchFor === "shopkeeper") {
				pipeline[0].$match.role = ROLE.SHOPKEEPER;
				pipelineCount[0].$match.role = ROLE.SHOPKEEPER;

				if (verification === "any") {
					pipeline.push(shopkeeperObj, { $unwind: "$shopkeeper" });
				} else {
					pipeline.splice(1, 0, shopkeeperObj, { $unwind: "$shopkeeper" });
					pipeline.splice(2, 0, shopkeeperVerificationObj);
					pipelineCount.push(
						shopkeeperObj,
						{ $unwind: "$shopkeeper" },
						shopkeeperVerificationObj
					);
				}
			}

			pipeline.push({
				$project: {
					user: {
						_id: "$_id",
						userName: "$userName",
						role: "$role",
						phone: "$phone",
					},
					address: 1,
					worker: 1,
					shopkeeper: 1,
					shopkeeperUser: 1,
				},
			});

			pipelineCount.push(countObj);
			[users, totalItems] = await Promise.all([
				UserModel.aggregate(pipeline),
				UserModel.aggregate(pipelineCount),
			]);
		} else if (searchBy === "pincode") {
			const pipeline = [{ $match: { pincode: search } }];

			pipeline.push(
				{
					$lookup: {
						from: "User",
						localField: "_id",
						foreignField: "_id",
						as: "user",
					},
				},
				{ $unwind: "$user" }
			);

			const pipelineCount = [...pipeline];
			if (searchFor === "worker") {
				pipeline.push(
					{ $match: { "user.role": ROLE.WORKER } },
					{ $skip: Number(process.env.LIMIT_ADMIN) * (page - 1) },
					{ $limit: Number(process.env.LIMIT_ADMIN) }
				);
				pipelineCount.push({ $match: { "user.role": ROLE.WORKER } });

				if (verification === "any") {
					pipeline.push(workerObj, { $unwind: "$worker" });
				} else {
					pipeline.splice(1, 0, workerObj, { $unwind: "$worker" });
					pipeline.splice(2, 0, workerVerificationObj);
					pipelineCount.push(workerObj, { $unwind: "$worker" }, workerVerificationObj);
				}

				pipeline.push(
					{
						$lookup: {
							from: "User",
							localField: "worker.shopkeeperId",
							foreignField: "_id",
							as: "shopkeeperUser",
						},
					},
					{
						$unwind: {
							path: "$shopkeeperUser",
							preserveNullAndEmptyArrays: true,
						},
					}
				);
			} else if (searchFor === "shopkeeper") {
				pipeline.push(
					{ $match: { "user.role": ROLE.SHOPKEEPER } },
					{ $skip: Number(process.env.LIMIT_ADMIN) * (page - 1) },
					{ $limit: Number(process.env.LIMIT_ADMIN) }
				);
				pipelineCount.push({ $match: { "user.role": ROLE.SHOPKEEPER } });

				if (verification === "any") {
					pipeline.push(shopkeeperObj, { $unwind: "$shopkeeper" });
				} else {
					pipeline.splice(1, 0, shopkeeperObj, { $unwind: "$shopkeeper" });
					pipeline.splice(2, 0, shopkeeperVerificationObj);
					pipelineCount.push(
						shopkeeperObj,
						{ $unwind: "$shopkeeper" },
						shopkeeperVerificationObj
					);
				}
			} else {
				pipeline.push(
					{ $skip: Number(process.env.LIMIT_ADMIN) * (page - 1) },
					{ $limit: Number(process.env.LIMIT_ADMIN) }
				);
			}

			pipeline.push({
				$project: {
					address: {
						_id: "$_id",
						society: "$society",
						area: "$area",
						city: "$city",
						state: "$state",
						pincode: "$pincode",
					},
					user: 1,
					worker: 1,
					shopkeeper: 1,
					shopkeeperUser: 1,
				},
			});

			pipelineCount.push(countObj);
			[users, totalItems] = await Promise.all([
				AddressModel.aggregate(pipeline),
				AddressModel.aggregate(pipelineCount),
			]);
		} else if (searchBy === "name") {
			const pattern = `\w*${search}\w*`;
			const pipeline = [
				{
					$match: {
						$and: [
							{ $text: { $search: search } },
							{ userName: new RegExp(pattern, "i") },
						],
					},
				},
			];
			const pipelineCount = [...pipeline];

			pipeline.push(
				{ $skip: Number(process.env.LIMIT_ADMIN) * (page - 1) },
				{ $limit: Number(process.env.LIMIT_ADMIN) },
				{
					$lookup: {
						from: "Address",
						localField: "_id",
						foreignField: "_id",
						as: "address",
					},
				},
				{ $unwind: "$address" }
			);

			if (searchFor === "worker") {
				pipeline[0].$match.role = ROLE.WORKER;
				pipelineCount[0].$match.role = ROLE.WORKER;

				if (verification === "any") {
					pipeline.push(workerObj, { $unwind: "$worker" });
				} else {
					pipeline.splice(1, 0, workerObj, { $unwind: "$worker" });
					pipeline.splice(2, 0, workerVerificationObj);
					pipelineCount.push(workerObj, { $unwind: "$worker" }, workerVerificationObj);
				}

				pipeline.push(
					{
						$lookup: {
							from: "User",
							localField: "worker.shopkeeperId",
							foreignField: "_id",
							as: "shopkeeperUser",
						},
					},
					{
						$unwind: {
							path: "$shopkeeperUser",
							preserveNullAndEmptyArrays: true,
						},
					}
				);
			} else if (searchFor === "shopkeeper") {
				pipeline[0].$match.role = ROLE.SHOPKEEPER;
				pipelineCount[0].$match.role = ROLE.SHOPKEEPER;

				if (verification === "any") {
					pipeline.push(shopkeeperObj, { $unwind: "$shopkeeper" });
				} else {
					pipeline.splice(1, 0, shopkeeperObj, { $unwind: "$shopkeeper" });
					pipeline.splice(2, 0, shopkeeperVerificationObj);
					pipelineCount.push(
						shopkeeperObj,
						{ $unwind: "$shopkeeper" },
						shopkeeperVerificationObj
					);
				}
			}

			pipeline.push({
				$project: {
					user: {
						_id: "$_id",
						userName: "$userName",
						role: "$role",
						phone: "$phone",
					},
					address: 1,
					worker: 1,
					shopkeeper: 1,
					shopkeeperUser: 1,
				},
			});

			pipelineCount.push(countObj);
			[users, totalItems] = await Promise.all([
				UserModel.aggregate(pipeline),
				UserModel.aggregate(pipelineCount),
			]);
		}

		if (totalItems && totalItems.length > 0) totalItems = totalItems[0].totalItems;
		else totalItems = 0;

		const message = "Found users";
		res.json(new Response(RESPONSE.SUCCESS, { message, users, totalItems }));
	} catch (error) {
		handleError(error);
	}
}

async function verifyServiceProvider(req, res) {
	try {
		const { userId } = req.body;

		const [worker, shopkeeper] = await Promise.all([
			WorkerModel.findById(userId),
			ShopkeeperModel.findById(userId),
		]);

		if (worker) {
			worker.isVerified = true;
			await worker.save();
		} else if (shopkeeper) {
			shopkeeper.isVerified = true;
			await shopkeeper.save();
		} else {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Verified";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
}

async function toggleCoadmin(req, res) {
	try {
		const userId = req.body.userId;
		const user = await UserModel.findById(userId);

		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (user.role === ROLE.USER) {
			user.role = ROLE.COADMIN;
			await user.save();
			const message = "Role changed";
			return res.json(new Response(RESPONSE.SUCCESS, { message, role: ROLE.COADMIN }));
		}

		if (user.role === ROLE.WORKER) {
			user.role = ROLE.COADMIN;
			await Promise.all([
				ServiceModel.deleteMany({ serviceProviderId: user._id }),
				WorkerServiceModel.deleteMany({ workerId: user._id }),
				LocationModel.deleteMany({ workerId: user._id }),
				user.save(),
			]);
			const message = "Role changed";
			return res.json(new Response(RESPONSE.SUCCESS, { message, role: ROLE.COADMIN }));
		}

		if (user.role === ROLE.SHOPKEEPER) {
			user.role = ROLE.COADMIN;
			const workers = await WorkerModel.find({ shopkeeperId: user._id });
			await Promise.all([
				user.save(),
				ServiceModel.deleteMany({ serviceProviderId: user._id }),
				ItemModel.deleteMany({ shopkeeperId: user._id }),
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
			const message = "Role changed";
			return res.json(new Response(RESPONSE.SUCCESS, { message, role: ROLE.COADMIN }));
		}

		if (user.role === ROLE.COADMIN) {
			user.role = ROLE.USER;
			await user.save();
			const message = "Role changed";
			return res.json(new Response(RESPONSE.SUCCESS, { message, role: ROLE.USER }));
		}

		if (user.role === ROLE.ADMIN) {
			const message = "Admin role cannot be changed";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}
	} catch (error) {
		handleError(error);
	}
}
