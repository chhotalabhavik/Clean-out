const mongoose = require("mongoose");

const UserModel = require("../models/User");
const ServiceModel = require("../models/Service");
const WorkerModel = require("../models/Worker");
const LocationModel = require("../models/Location");
const ServiceOrderModel = require("../models/ServiceOrder");
const WorkerServiceModel = require("../models/WorkerService");
const Response = require("../models/Response");
const ROLE = require("../models/Enums/ROLE");
const RESPONSE = require("../models/Enums/RESPONSE");
const NOTIFICATION = require("../models/Enums/NOTIFICATION");
const { getRatingsWithUserName } = require("./RatingController");

const handleError = require("../utilities/errorHandler");
const { stringToArray } = require("../utilities/formatter");
const { sendNotifications } = require("../utilities/notifications");

const getService = async (req, res) => {
	try {
		const serviceId = req.params.serviceId;
		const service = await ServiceModel.findById(serviceId);
		if (!service) {
			const message = "Service not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Found service";
		res.json(new Response(RESPONSE.SUCCESS, { message, service }));
	} catch (error) {
		handleError(error);
	}
};

const getOnlyWorkerService = async (req, res) => {
	try {
		const workerId = req.query.workerId;
		const serviceId = req.query.serviceId;
		const workerService = await WorkerServiceModel.findOne({ workerId, serviceId });
		if (!workerService) {
			const message = "Worker service not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Found worker service";
		res.json(new Response(RESPONSE.SUCCESS, { message, workerService }));
	} catch (error) {
		handleError(error);
	}
};

const getWorkerServiceWithRatings = async (req, res) => {
	try {
		const workerServiceId = req.params.workerServiceId;
		const workerService = await WorkerServiceModel.findById(workerServiceId);
		if (!workerService) {
			const message = "Worker service not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const workerId = workerService.workerId;
		const serviceId = workerService.serviceId;
		const [workerUser, worker, service, ratings] = await Promise.all([
			UserModel.findById(workerId),
			WorkerModel.findById(workerId),
			ServiceModel.findById(serviceId),
			getRatingsWithUserName(workerServiceId),
		]);

		const message = "Found service";
		res.json(
			new Response(RESPONSE.SUCCESS, {
				message,
				service,
				workerUser,
				worker,
				workerService,
				ratings,
			})
		);
	} catch (error) {
		handleError(error);
	}
};

const getServiceCount = async (req, res) => {
	try {
		const serviceProviderId = req.params.serviceProviderId;

		const query = { serviceProviderId: mongoose.Types.ObjectId(serviceProviderId) };
		const serviceCount = await ServiceModel.aggregate([
			{ $match: query },
			{ $count: "serviceCount" },
		]);

		const message = "Found count";
		res.json(new Response(RESPONSE.SUCCESS, { message, count: serviceCount.serviceCount }));
	} catch (error) {
		handleError(error);
	}
};

const getServices = async (req, res) => {
	try {
		const serviceProviderId = req.params.serviceProviderId;
		const page = req.query.page;

		const pipeline = [
			{ $match: { serviceProviderId: mongoose.Types.ObjectId(serviceProviderId) } },
		];
		const pipelineCount = [...pipeline, { $count: "totalItems" }];
		pipeline.push(
			{ $skip: Number(process.env.LIMIT_SERVICES) * (page - 1) },
			{ $limit: Number(process.env.LIMIT_SERVICES) }
		);

		let [services, totalItems] = await Promise.all([
			ServiceModel.aggregate(pipeline),
			ServiceModel.aggregate(pipelineCount),
		]);

		if (totalItems && totalItems.length > 0) totalItems = totalItems[0].totalItems;
		else totalItems = 0;

		const message = "Found services";
		res.json(new Response(RESPONSE.SUCCESS, { message, services, totalItems }));
	} catch (error) {
		handleError(error);
	}
};

const getWorkerServicesForStore = async (req, res) => {
	try {
		const page = req.query.page || 1;
		const sortBy = req.query.sortBy || "price";
		const pincode = req.query.pincode;
		const serviceCategory = req.query.serviceCategory;
		let subCategories = req.query.subCategories;
		if (subCategories) subCategories = stringToArray(subCategories);
		else subCategories = [];

		const pipeline = [
			{ $match: { pincode: pincode } },
			{ $project: { _id: 0, workerId: 1 } },
			{
				$lookup: {
					from: "WorkerService",
					localField: "workerId",
					foreignField: "workerId",
					as: "workerService",
				},
			},
			{ $match: { $expr: { $gt: [{ $size: "$workerService" }, 0] } } },
			{ $unwind: "$workerService" },
			{
				$lookup: {
					from: "Service",
					localField: "workerService.serviceId",
					foreignField: "_id",
					as: "service",
				},
			},
			{ $unwind: "$service" },
			{ $match: { "service.serviceCategory": serviceCategory } },
		];

		subCategories.forEach((subCategory) => {
			pipeline.push({
				$match: {
					"service.subCategories": {
						$elemMatch: {
							name: subCategory,
						},
					},
				},
			});
		});

		let pipelineCount = [];
		if (sortBy === "price") {
			pipeline.push(
				{ $unwind: "$service.subCategories" },
				{
					$group: {
						_id: "$workerService._id",
						price: { $sum: "$service.subCategories.price" },
					},
				},
				{ $sort: { price: 1 } }
			);

			pipelineCount = [...pipeline, { $count: "totalItems" }];

			pipeline.push(
				{ $skip: Number(process.env.LIMIT_SERVICES) * (page - 1) },
				{ $limit: Number(process.env.LIMIT_SERVICES) },
				{
					$lookup: {
						from: "WorkerService",
						localField: "_id",
						foreignField: "_id",
						as: "workerService",
					},
				},
				{ $unwind: "$workerService" },
				{
					$lookup: {
						from: "Service",
						localField: "workerService.serviceId",
						foreignField: "_id",
						as: "service",
					},
				},
				{ $unwind: "$service" }
			);
		} else if (sortBy === "ratingValue") {
			pipeline.push({ $sort: { "workerService.ratingValue": -1 } });
			pipelineCount = [...pipeline, { $count: "totalItems" }];
			pipeline.push(
				{ $skip: Number(process.env.LIMIT_SERVICES) * (page - 1) },
				{ $limit: Number(process.env.LIMIT_SERVICES) },
				{
					$project: {
						_id: "$workerService._id",
						workerService: 1,
						service: 1,
					},
				}
			);
		} else if (sortBy === "orderedCount") {
			pipeline.push({ $sort: { "workerService.orderedCount": -1 } });
			pipelineCount = [...pipeline, { $count: "totalItems" }];
			pipeline.push(
				{ $skip: Number(process.env.LIMIT_SERVICES) * (page - 1) },
				{ $limit: Number(process.env.LIMIT_SERVICES) },
				{
					$project: {
						_id: "$workerService._id",
						workerService: 1,
						service: 1,
					},
				}
			);
		}

		pipeline.push(
			{
				$lookup: {
					from: "User",
					localField: "workerService.workerId",
					foreignField: "_id",
					as: "workerUser",
				},
			},
			{ $unwind: "$workerUser" },
			{
				$lookup: {
					from: "Worker",
					localField: "workerService.workerId",
					foreignField: "_id",
					as: "worker",
				},
			},
			{ $unwind: "$worker" },
			{
				$lookup: {
					from: "Shopkeeper",
					localField: "worker.shopkeeperId",
					foreignField: "_id",
					as: "shopkeeper",
				},
			},
			{
				$unwind: {
					path: "$shopkeeper",
					preserveNullAndEmptyArrays: true,
				},
			}
		);

		let [services, totalItems] = await Promise.all([
			LocationModel.aggregate(pipeline),
			LocationModel.aggregate(pipelineCount),
		]);

		if (totalItems && totalItems.length > 0) totalItems = totalItems[0].totalItems;
		else totalItems = 0;

		services = services.map((service) => {
			if (service.price) return service;
			let price = 0;
			service.service.subCategories.forEach((val) => (price += val.price));
			return { ...service, price };
		});

		const message = "Found services";
		res.json(new Response(RESPONSE.SUCCESS, { message, services, totalItems }));
	} catch (error) {
		handleError(error);
	}
};

const addService = async (req, res) => {
	try {
		const serviceProviderId = req.params.serviceProviderId;
		const serviceProviderUser = await UserModel.findById(serviceProviderId);
		if (!serviceProviderUser || serviceProviderUser.role === ROLE.USER) {
			const message = "Service provider not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const service = new ServiceModel();
		const _id = mongoose.Types.ObjectId();
		service._id = _id;
		service.serviceProviderId = serviceProviderId;
		service.serviceName = req.body.serviceName;
		service.serviceCategory = req.body.serviceCategory;
		service.subCategories = req.body.subCategories;
		service.description = req.body.description;

		if (serviceProviderUser.role === ROLE.WORKER) {
			const workerService = new WorkerServiceModel({
				workerId: serviceProviderId,
				serviceId: _id,
			});
			await Promise.all([workerService.save(), service.save()]);
		} else {
			const workers = await WorkerModel.find({ shopkeeperId: serviceProviderId });
			await Promise.all([
				service.save(),
				Promise.all(
					workers.map((worker) =>
						new WorkerServiceModel({ workerId: worker._id, serviceId: _id }).save()
					)
				),
			]);
		}

		const message = "Added service";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: service._id }));
	} catch (error) {
		handleError(error);
	}
};

const updateService = async (req, res) => {
	try {
		const serviceId = req.params.serviceId;
		const service = await ServiceModel.findById(serviceId);
		if (!service) {
			const message = "Service not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		service.serviceName = req.body.serviceName;
		service.serviceCategory = req.body.serviceCategory;
		service.subCategories = req.body.subCategories;
		service.description = req.body.description;

		await service.save();
		const message = "Updated service";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const deleteService = async (req, res) => {
	try {
		const serviceId = req.params.serviceId;
		const service = await ServiceModel.findById(serviceId);
		if (!service) {
			const message = "Service not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const serviceProviderId = service.serviceProviderId;
		const serviceProviderUser = await UserModel.findById(serviceProviderId);
		if (!serviceProviderUser) {
			const message = "Service provider not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (serviceProviderUser.role === ROLE.WORKER) {
			await Promise.all([
				service.delete(),
				WorkerServiceModel.deleteOne({ workerId: serviceProviderId, serviceId }),
			]);
		} else {
			const workers = await WorkerModel.find({ shopkeeperId: serviceProviderId });
			await Promise.all([
				service.delete(),
				Promise.all(
					workers.map((worker) =>
						WorkerServiceModel.deleteOne({ workerId: worker._id, serviceId })
					)
				),
			]);
		}

		const message = "Deleted service";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const bookService = async (req, res) => {
	try {
		const workerServiceId = req.params.workerServiceId;
		const userId = req.body.userId;

		const workerService = await WorkerServiceModel.findById(workerServiceId);
		if (!workerService) {
			const message = "Worker service not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const workerId = workerService.workerId;
		const serviceId = workerService.serviceId;

		const [service, user, workerUser, worker] = await Promise.all([
			ServiceModel.findById(serviceId),
			UserModel.findById(userId),
			UserModel.findById(workerId),
			WorkerModel.findById(workerId),
		]);

		let message = null;
		if (!service) message = "Service not found";
		else if (!user) message = "User not found";
		else if (!workerUser) message = "Worker not found";
		else if (!workerService) message = "Service for worker not found";

		if (message) return res.json(new Response(RESPONSE.FAILURE, { message }));

		const serviceOrder = new ServiceOrderModel();
		serviceOrder.userId = userId;
		serviceOrder.workerId = workerId;
		serviceOrder.serviceId = serviceId;
		serviceOrder.price = req.body.price;
		serviceOrder.metaData = req.body.metaData;
		serviceOrder.serviceCategory = service.serviceCategory;
		workerService.orderedCount++;

		const targets = [user.phone, workerUser.phone];
		if (worker.isDependent === "true") {
			const shopkeeperUser = await UserModel.findById(worker.shopkeeperId);
			serviceOrder.shopkeeperId = shopkeeperUser._id;
			targets.push(shopkeeperUser.phone);
		}

		await Promise.all([serviceOrder.save(), workerService.save()]);
		message = `Order placed with total price : ${serviceOrder.price}`;
		sendNotifications(message, targets, NOTIFICATION.PLACED_ORDER);

		message = "Placed order";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: serviceOrder._id }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getService,
	getOnlyWorkerService,
	getWorkerServiceWithRatings,
	getServiceCount,
	getServices,
	getWorkerServicesForStore,
	addService,
	updateService,
	deleteService,
	bookService,
};
