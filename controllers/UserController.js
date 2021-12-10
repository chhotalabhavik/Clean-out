const mongoose = require("mongoose");

const UserModel = require("../models/User");
const AddressModel = require("../models/Address");
const ItemModel = require("../models/Item");
const ServiceOrderModel = require("../models/ServiceOrder");
const ItemOrderModel = require("../models/ItemOrder");
const ServiceModel = require("../models/Service");
const OrderItemPackModel = require("../models/OrderItemPack");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");

const bcrypt = require("bcryptjs");
const handleError = require("../utilities/errorHandler");
const encrypt = require("../utilities/encrypt");

const getRole = async (userId) => {
	try {
		const user = await UserModel.findById(userId);
		return user && user.role;
	} catch (error) {
		handleError(error);
	}
};

const getOrders = async (userId) => {
	try {
		let [serviceOrders, itemOrders] = await Promise.all([
			ServiceOrderModel.find({ userId }),
			ItemOrderModel.find({ userId }),
		]);

		serviceOrders = await Promise.all(
			serviceOrders.map(async (serviceOrder) => {
				const [workerUser, service] = await Promise.all([
					UserModel.findById(serviceOrder.workerId),
					ServiceModel.findById(serviceOrder.serviceId),
				]);
				return { workerUser, service, serviceOrder };
			})
		);

		itemOrders = await Promise.all(
			itemOrders.map(async (itemOrder) => {
				const orderId = itemOrder._id;
				let orderItemPacks = await OrderItemPackModel.find({ orderId });
				orderItemPacks = await Promise.all(
					orderItemPacks.map(async (orderItemPack) => {
						const itemId = orderItemPack.itemId;
						const item = await ItemModel.findById(itemId);
						return { orderItemPack, item };
					})
				);
				return { itemOrder, orderItemPacks };
			})
		);

		return { serviceOrders, itemOrders };
	} catch (error) {
		handleError(error);
	}
};

const getUserById = async (req, res) => {
	try {
		const userId = req.params.userId;
		const [user, address] = await Promise.all([
			UserModel.findById(userId),
			AddressModel.findById(userId),
		]);

		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "User found";
		res.json(new Response(RESPONSE.SUCCESS, { message, user, address }));
	} catch (error) {
		handleError(error);
	}
};

const getUserWithOrders = async (req, res) => {
	try {
		const userId = req.params.userId;
		const [user, address] = await Promise.all([
			UserModel.findById(userId),
			AddressModel.findById(userId),
		]);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const { serviceOrders, itemOrders } = await getOrders(userId);
		const message = "User found";
		res.json(
			new Response(RESPONSE.SUCCESS, { message, user, address, serviceOrders, itemOrders })
		);
	} catch (error) {
		handleError(error);
	}
};

const getUserByPhone = async (req, res) => {
	try {
		const phone = req.query.phone;
		const user = await UserModel.findOne({ phone });
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const address = await AddressModel.findById(user._id);
		const message = "User found";
		res.json(new Response(RESPONSE.SUCCESS, { message, user, address }));
	} catch (error) {
		handleError(error);
	}
};

const registerUser = async (req, res) => {
	try {
		const { userName, phone, role } = req.body;
		const { society, area, pincode, city, state } = req.body;
		const password = await encrypt(req.body.password);

		let user = await UserModel.findOne({ phone });
		if (user) {
			const message = "Registered phone number already";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const _id = mongoose.Types.ObjectId();
		user = new UserModel({ _id, userName, phone, password, role });
		const address = new AddressModel({ _id, society, area, pincode, city, state });
		await Promise.all([user.save(), address.save()]);

		const message = "Registered user";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: user._id }));
	} catch (error) {
		handleError(error);
	}
};

const updateUser = async (req, res) => {
	try {
		const userId = req.params.userId;
		const { userName, phone, password, newPassword } = req.body;
		const { society, area, pincode, city, state } = req.body;
		const { isAdmin } = req.body;

		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const isMatch = await bcrypt.compare(password || "", user.password);
		if (!isMatch && !isAdmin) {
			const message = "Password incorrect";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		user.userName = userName;
		user.phone = phone;
		if (newPassword) user.password = await encrypt(newPassword);

		await Promise.all([
			user.save(),
			AddressModel.findByIdAndUpdate(userId, { society, area, pincode, city, state }),
		]);

		const message = "Updated user";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const removeUser = async (req, res) => {
	try {
		const userId = req.params.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		await Promise.all([user.delete(), AddressModel.findByIdAndDelete(userId)]);
		const message = "Deleted user";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const resetPassword = async (req, res) => {
	try {
		const { phone, password } = req.body;
		const user = await UserModel.findOne({ phone });
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}
		user.password = await encrypt(password);
		await user.save();

		const message = "Updated password";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getRole,
	getUserById,
	getOrders,
	getUserWithOrders,
	getUserByPhone,
	registerUser,
	updateUser,
	removeUser,
	resetPassword,
};
