const mongoose = require("mongoose");

const Response = require("../models/Response");
const ItemModel = require("../models/Item");
const UserModel = require("../models/User");
const ShopkeeperModel = require("../models/Shopkeeper");
const ItemOrderModel = require("../models/ItemOrder");
const CartItemPackModel = require("../models/CartItemPack");
const OrderItemPackModel = require("../models/OrderItemPack");
const RESPONSE = require("../models/Enums/RESPONSE");
const NOTIFICATION = require("../models/Enums/NOTIFICATION");

const handleError = require("../utilities/errorHandler");
const { sendNotifications } = require("../utilities/notifications");

const getCartItems = async (req, res) => {
	try {
		const userId = req.params.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		let cartItemPacks = await CartItemPackModel.find({ userId });
		const itemsToRemove = [];
		await Promise.all(
			cartItemPacks.map(async (cartItemPack) => {
				const itemId = cartItemPack.itemId;
				const item = await ItemModel.findById(itemId);
				if (!item || !item.isAvailable) {
					const _id = cartItemPack._id;
					itemsToRemove.push(_id);
					return CartItemPack.findByIdAndDelete(_id);
				}
			})
		);

		cartItemPacks = cartItemPacks.filter(
			(cartItemPack) => !itemsToRemove.includes(cartItemPack._id)
		);
		cartItemPacks = await Promise.all(
			cartItemPacks.map(async (cartItemPack) => {
				const itemId = cartItemPack.itemId;
				const item = await ItemModel.findById(itemId);
				const shopkeeper = await ShopkeeperModel.findById(item.shopkeeperId);
				return { ...cartItemPack._doc, item, shopkeeper };
			})
		);

		const message = "Found cart";
		res.json(new Response(RESPONSE.SUCCESS, { message, cartItemPacks }));
	} catch (error) {
		handleError(error);
	}
};

const changeCartItemCount = async (req, res) => {
	try {
		const cartItemPackId = req.params.cartItemPackId;
		const cartItemPack = await CartItemPackModel.findById(cartItemPackId);
		if (!cartItemPack) {
			const message = "Item not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const itemId = cartItemPack.itemId;
		const value = Number(req.body.value);

		const item = await ItemModel.findById(itemId);
		if (!item) {
			const message = "Item not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		cartItemPack.count = value;
		if (value === 0) await cartItemPack.delete();
		else await cartItemPack.save();

		const message = "Updated item count";
		res.json(new Response(RESPONSE.SUCCESS, { message, cartItemPack }));
	} catch (error) {
		handleError(error);
	}
};

const clearCart = async (req, res) => {
	try {
		const userId = req.params.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		await CartItemPackModel.deleteMany({ userId });
		const message = "Cleared cart";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const placeOrder = async (req, res) => {
	try {
		const userId = req.params.userId;
		const user = await UserModel.findById(userId);
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE), { message });
		}

		let netPrice = 0;
		const orderId = mongoose.Types.ObjectId();
		const cartItemPacks = await CartItemPackModel.find({ userId });
		await Promise.all(
			cartItemPacks.map(async (cartItemPack) => {
				const itemId = cartItemPack.itemId;
				const item = await ItemModel.findById(itemId);
				if (!item || !item.isAvailable) return;

				const shopkeeperId = item.shopkeeperId;
				const shopkeeperUser = await UserModel.findById(shopkeeperId);

				const count = cartItemPack.count;
				const price = item.price * count;
				netPrice += price;
				const orderItemPack = new OrderItemPackModel({
					orderId,
					shopkeeperId,
					itemId,
					count,
					price,
				});
				item.orderedCount++;

				const message = `Placed order of ${price}`;
				sendNotifications(message, [shopkeeperUser.phone], NOTIFICATION.PLACED_ORDER);
				return Promise.all([item.save(), orderItemPack.save()]);
			})
		);

		const itemOrder = new ItemOrderModel({ _id: orderId, userId, price: netPrice });
		await Promise.all([itemOrder.save(), CartItemPackModel.deleteMany({ userId })]);

		let message = `Placed order of ${netPrice}`;
		sendNotifications(message, [user.phone], NOTIFICATION.PLACED_ORDER);

		message = "Placed order";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: itemOrder._id }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getCartItems,
	changeCartItemCount,
	clearCart,
	placeOrder,
};
