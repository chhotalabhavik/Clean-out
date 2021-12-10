const mongoose = require("mongoose");
const UserModel = require("../models/User");
const ItemModel = require("../models/Item");
const ShopkeeperModel = require("../models/Shopkeeper");
const RatingModel = require("../models/Rating");
const CartItemPack = require("../models/CartItemPack");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");
const { getRatingsWithUserName } = require("../controllers/RatingController");

const handleError = require("../utilities/errorHandler");
const { deleteFiles, useSharp } = require("../utilities/FileHandlers");

const getItemsRandom = async (req, res) => {
	try {
		const count = await ItemModel.countDocuments();
		const random = Math.max(Math.min(Math.floor(Math.random() * count), count - 4), 0);
		const items = await ItemModel.find().skip(random).limit(4);
		res.json(new Response(RESPONSE.SUCCESS, { message: "Items found", items }));
	} catch (error) {
		handleError(error);
	}
};

const getItem = async (req, res) => {
	try {
		const itemId = req.params.itemId;
		const item = await ItemModel.findById(itemId);
		if (!item) {
			const message = "Item not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Found item";
		res.json(new Response(RESPONSE.SUCCESS, { message, item }));
	} catch (error) {
		handleError(error);
	}
};

const getItemWithRatings = async (req, res) => {
	try {
		const itemId = req.params.itemId;
		let item = await ItemModel.findById(itemId);
		if (!item) {
			const message = "Item not found";
			res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const shopkeeper = await ShopkeeperModel.findById(item.shopkeeperId);
		item = { ...item._doc, shopkeeper };

		const ratings = await getRatingsWithUserName(itemId);
		const message = "Item found";
		res.json(new Response(RESPONSE.SUCCESS, { message, item, ratings }));
	} catch (error) {
		handleError(error);
	}
};

const getItems = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const page = req.query.page;

		const pipeline = [{ $match: { shopkeeperId: mongoose.Types.ObjectId(shopkeeperId) } }];
		const pipelineCount = [...pipeline, { $count: "totalItems" }];
		pipeline.push(
			{ $skip: Number(process.env.LIMIT_ITEMS) * (page - 1) },
			{ $limit: Number(process.env.LIMIT_ITEMS) }
		);

		let [items, totalItems] = await Promise.all([
			ItemModel.aggregate(pipeline),
			ItemModel.aggregate(pipelineCount),
		]);

		if (totalItems && totalItems.length > 0) totalItems = totalItems[0].totalItems;
		else totalItems = 0;

		const message = "Found services";
		res.json(new Response(RESPONSE.SUCCESS, { message, items, totalItems }));
	} catch (error) {
		handleError(error);
	}
};

const getItemsForStore = async (req, res) => {
	try {
		const search = req.query.search || null;
		const sortBy = req.query.sortBy || "price";
		const page = req.query.page;

		const query = {};
		const sort = {};

		if (search) {
			const pattern = `\w*${search}\w*`;
			query.$and = [
				{ $text: { $search: search } },
				{
					$or: [
						{ itemName: new RegExp(pattern, "i") },
						{ description: new RegExp(pattern, "i") },
					],
				},
			];
		}
		sort[sortBy] = sortBy === "price" ? 1 : -1;

		const pipeline = [{ $match: query }, { $sort: sort }];
		const pipelineCount = [...pipeline, { $count: "totalItems" }];

		pipeline.push(
			{ $skip: Number(process.env.LIMIT_ITEMS) * (page - 1) },
			{ $limit: Number(process.env.LIMIT_ITEMS) },
			{
				$lookup: {
					from: "Shopkeeper",
					localField: "shopkeeperId",
					foreignField: "_id",
					as: "shopkeeper",
				},
			},
			{ $unwind: "$shopkeeper" }
		);

		let [totalItems, items] = await Promise.all([
			ItemModel.aggregate(pipelineCount),
			ItemModel.aggregate(pipeline),
		]);

		if (totalItems && totalItems.length > 0) totalItems = totalItems[0].totalItems;
		else totalItems = 0;

		const message = "Items found";
		res.json(new Response(RESPONSE.SUCCESS, { message, items, totalItems }));
	} catch (error) {
		handleError(error);
	}
};

const addItem = async (req, res) => {
	try {
		const shopkeeperId = req.params.shopkeeperId;
		const shopkeeper = await ShopkeeperModel.findById(shopkeeperId);
		if (!shopkeeper) {
			const message = "Shopkeeper not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const { itemName, price, description } = req.body;
		const itemImage = req.files.itemImage[0].filename;
		const item = new ItemModel({ shopkeeperId, itemName, price, description, itemImage });
		await Promise.all([item.save(), useSharp([itemImage])]);

		const message = "Added item";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: item._id }));
	} catch (error) {
		handleError(error);
	}
};

const updateItem = async (req, res) => {
	try {
		const itemId = req.params.itemId;
		const item = await ItemModel.findById(itemId);
		if (!item) {
			const message = "Item not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		item.itemName = req.body.itemName;
		item.description = req.body.description;
		item.price = req.body.price;
		item.isAvailable = req.body.isAvailable;

		if (req.files.itemImage) {
			const itemImage = req.files.itemImage[0].filename;
			await Promise.all([deleteFiles([item.itemImage]), useSharp([itemImage])]);
			item.itemImage = itemImage;
		}

		await item.save();
		const message = "Updated item";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const deleteItem = async (req, res) => {
	try {
		const itemId = req.params.itemId;
		const item = await ItemModel.findById(itemId);
		if (!item) {
			const message = "Item not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		await Promise.all([item.delete(), deleteFiles([item.itemImage])]);
		const message = "Deleted item";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const addToCart = async (req, res) => {
	try {
		const itemId = req.params.itemId;
		const userId = req.body.userId;

		const [item, user] = await Promise.all([
			ItemModel.findById(itemId),
			UserModel.findById(userId),
		]);

		let message = null;
		if (!item) message = "Item not found";
		else if (!user) message = "User not found";
		if (message) return res.json(new Response(RESPONSE.FAILURE, { message }));

		const count = req.body.count;
		let cartItemPack = await CartItemPack.findOne({ userId, itemId });
		if (cartItemPack) {
			cartItemPack.count = Number(cartItemPack.count) + Number(count);
			await cartItemPack.save();
		} else {
			cartItemPack = new CartItemPack({ userId, itemId, count });
			await cartItemPack.save();
		}

		message = "Added item to cart";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: cartItemPack._id }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getItemsRandom,
	getItem,
	getItemWithRatings,
	getItems,
	getItemsForStore,
	addItem,
	updateItem,
	deleteItem,
	addToCart,
};
