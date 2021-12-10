const mongoose = require("mongoose");
const moment = require("moment");

const UserModel = require("../models/User");
const ItemModel = require("../models/Item");
const AddressModel = require("../models/Address");
const ItemOrderModel = require("../models/ItemOrder");
const OrderItemPackModel = require("../models/OrderItemPack");
const Response = require("../models/Response");
const ROLE = require("../models/Enums/ROLE");
const STATUS = require("../models/Enums/STATUS");
const RESPONSE = require("../models/Enums/RESPONSE");
const NOTIFICATION = require("../models/Enums/NOTIFICATION");

const handleError = require("../utilities/errorHandler");
const { sendNotifications } = require("../utilities/notifications");

const getItemOrder = async (req, res) => {
	try {
		const orderId = req.params.orderId;
		const itemOrder = await ItemOrderModel.findById(orderId);
		if (!itemOrder) {
			const message = "Item order not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const userId = itemOrder.userId;
		const pipeline = [
			{ $match: { orderId: mongoose.Types.ObjectId(orderId) } },
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
				$lookup: {
					from: "Shopkeeper",
					localField: "item.shopkeeperId",
					foreignField: "_id",
					as: "shopkeeper",
				},
			},
			{ $unwind: "$shopkeeper" },
		];

		const [user, address, orderItemPacks] = await Promise.all([
			UserModel.findById(userId),
			AddressModel.findById(userId),
			OrderItemPackModel.aggregate(pipeline),
		]);

		const message = "Item order found";
		res.json(
			new Response(RESPONSE.SUCCESS, { message, user, address, itemOrder, orderItemPacks })
		);
	} catch (error) {
		handleError(error);
	}
};

const replaceItemOrder = async (req, res) => {
	try {
		const orderId = req.params.orderId;
		const itemOrder = await ItemOrderModel.findById(orderId);
		if (!itemOrder) {
			const message = "Item order not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const userId = itemOrder.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		let netPrice = 0;
		const newOrderId = mongoose.Types.ObjectId();
		const orderItemPacks = await OrderItemPackModel.find({ orderId });
		await Promise.all(
			orderItemPacks.map(async (orderItemPack) => {
				const shopkeeperId = orderItemPack.shopkeeperId;
				const itemId = orderItemPack.itemId;
				const [shopkeeperUser, item] = await Promise.all([
					UserModel.findById(shopkeeperId),
					ItemModel.findById(itemId),
				]);

				if (!shopkeeperUser || !item) return;

				const price = item.price * orderItemPack.count;
				netPrice += price;
				const newOrderItemPack = new OrderItemPackModel({
					orderId: newOrderId,
					shopkeeperId,
					itemId,
					count: orderItemPack.count,
					price,
				});

				item.orderedCount++;
				await Promise.all([item.save(), newOrderItemPack.save()]);

				const message = `Placed order of ${price}`;
				sendNotifications(message, [shopkeeperUser.phone], NOTIFICATION.PLACED_ORDER);
			})
		);

		let message = `Placed order of ${netPrice}`;
		sendNotifications(message, [user.phone], NOTIFICATION.PLACED_ORDER);
		await new ItemOrderModel({ _id: newOrderId, userId, price: netPrice }).save();

		message = "Placed order";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: newOrderId }));
	} catch (error) {
		handleError(error);
	}
};

const changeItemOrderStatus = async (req, res) => {
	try {
		const orderItemPackId = req.params.orderItemPackId;
		const status = req.body.status;

		const orderItemPack = await OrderItemPackModel.findById(orderItemPackId);
		if (!orderItemPack) {
			const message = "Item order not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}
		const [itemOrder, item] = await Promise.all([
			ItemOrderModel.findById(orderItemPack.orderId),
			ItemModel.findById(orderItemPack.itemId),
		]);
		const user = await UserModel.findById(itemOrder.userId);

		orderItemPack.status = status;
		if (status === STATUS.DELIVERED)
			orderItemPack.deliveredDate = moment().format(process.env.DATE_FORMAT);
		await orderItemPack.save();

		const targets = [];
		if (user) targets.push(user.phone);
		if (status === STATUS.DISPATCHED) {
			const message = `${item ? item.itemName : ""} dispatched`;
			sendNotifications(message, targets, NOTIFICATION.DISPATCHED_ORDER);
		} else if (status === STATUS.DELIVERED) {
			const message = `${item ? item.itemName : ""} delivered`;
			sendNotifications(message, targets, NOTIFICATION.DELIVERED_ORDER);
		}

		const message = "Changed status";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const cancelItemOrderPack = async (req, res) => {
	try {
		const orderItemPackId = req.params.orderItemPackId;
		const orderItemPack = await OrderItemPackModel.findById(orderItemPackId);
		if (!orderItemPack) {
			const message = "Item order pack not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		if (orderItemPack.status === STATUS.CANCELLED) {
			const message = "Item order pack already cancelled";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const itemId = orderItemPack.itemId;
		const item = await ItemModel.findById(itemId);
		if (item) {
			item.orderedCount--;
			await item.save();
		}

		orderItemPack.status = STATUS.CANCELLED;
		const orderId = orderItemPack.orderId;
		const shopkeeperId = orderItemPack.shopkeeperId;
		const [itemOrder, shopkeeperUser] = await Promise.all([
			ItemOrderModel.findById(orderId),
			UserModel.findById(shopkeeperId),
			orderItemPack.save(),
		]);

		const userId = itemOrder.userId;
		const user = await UserModel.findById(userId);

		let message = `Cancelled order of ${item ? item.itemName : ""}`;
		const targets = [];
		if (user) targets.push(user.phone);
		if (shopkeeperUser) targets.push(shopkeeperUser.phone);
		sendNotifications(message, targets, NOTIFICATION.CANCEL_ORDER);

		message = "Item order pack cancelled";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getItemOrder,
	cancelItemOrderPack,
	replaceItemOrder,
	changeItemOrderStatus,
};
