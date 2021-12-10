const mongoose = require("mongoose");
const UserModel = require("../models/User");
const RatingModel = require("../models/Rating");
const ItemModel = require("../models/Item");
const WorkerServiceModel = require("../models/WorkerService");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");

const handleError = require("../utilities/errorHandler");

function findNewRating(ratingPrev, ratingNew, count) {
	if (count === 0) return Number(ratingNew).toFixed(2);
	return Number((ratingPrev * count + ratingNew) / (count + 1)).toFixed(2);
}

const getRatingById = async (req, res) => {
	try {
		const ratingId = req.params.ratingId;
		const rating = await RatingModel.findById(ratingId);
		if (!rating) {
			const message = "Rating not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Found rating";
		res.json(new Response(RESPONSE.SUCCESS, { message, rating }));
	} catch (error) {
		handleError(error);
	}
};

const getRatingByTargetAndUser = async (req, res) => {
	try {
		const userId = req.params.userId;
		const targetId = req.query.targetId;
		const rating = await RatingModel.findOne({ targetId, userId });
		if (!rating) {
			const message = "Rating not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Found rating";
		res.json(new Response(RESPONSE.SUCCESS, { message, rating }));
	} catch (error) {
		handleError(error);
	}
};

const getRatingsWithUserName = async (targetId, lastKey = null) => {
	try {
		const query = {
			targetId: mongoose.Types.ObjectId(targetId),
			$expr: { $gt: [{ $strLenCP: "$description" }, 0] },
		};
		if (lastKey) query.userId = { $gt: mongoose.Types.ObjectId(lastKey) };

		const ratings = await RatingModel.aggregate([
			{ $match: query },
			{ $limit: Number(process.env.LIMIT_RATING) },
			{
				$lookup: {
					from: "User",
					localField: "userId",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{
				$project: {
					userId: 1,
					targetId: 1,
					ratingValue: 1,
					description: 1,
					userName: "$user.userName",
				},
			},
		]);
		return ratings;
	} catch (error) {
		handleError(error);
	}
};

const getRatings = async (req, res) => {
	try {
		const targetId = req.params.targetId;
		const lastKey = req.query.lastKey || null;
		const ratings = await getRatingsWithUserName(targetId, lastKey);
		const message = "Found ratings";
		res.json(new Response(RESPONSE.SUCCESS, { message, ratings }));
	} catch (error) {
		handleError(error);
	}
};

const addRating = async (req, res) => {
	try {
		const userId = req.params.userId;
		const user = UserModel.findById(userId);
		const targetId = req.body.targetId;
		const target = req.body.target;
		if (!user) {
			const message = "User not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const rating = new RatingModel();
		rating.userId = userId;
		rating.targetId = targetId;
		rating.ratingValue = req.body.ratingValue;
		rating.description = req.body.description;

		if (target === "ITEM") {
			const item = await ItemModel.findById(targetId);
			item.ratingValue = findNewRating(
				item.ratingValue,
				req.body.ratingValue,
				Number(item.ratingCount)
			);
			item.ratingCount++;
			await Promise.all([item.save(), rating.save()]);
		} else {
			const workerService = await WorkerServiceModel.findById(targetId);
			workerService.ratingValue = findNewRating(
				workerService.ratingValue,
				req.body.ratingValue,
				Number(workerService.ratingCount)
			);
			workerService.ratingCount++;
			await Promise.all([workerService.save(), rating.save()]);
		}

		const message = "Added rating";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: rating._id }));
	} catch (error) {
		handleError(error);
	}
};

const updateRating = async (req, res) => {
	try {
		const ratingId = req.params.ratingId;
		const rating = await RatingModel.findById(ratingId);
		if (!rating) {
			const message = "Rating not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const target = req.body.target;
		const targetId = rating.targetId;
		const ratingValue = req.body.ratingValue;
		const description = req.body.description;

		if (target === "SERVICE") {
			const workerService = await WorkerServiceModel.findById(targetId);
			workerService.ratingValue =
				workerService.ratingValue +
				(ratingValue - rating.ratingValue) / workerService.ratingCount;
			await workerService.save();
		} else {
			const item = await ItemModel.findById(targetId);
			item.ratingValue =
				item.ratingValue + (ratingValue - rating.ratingValue) / item.ratingCount;
			await item.save();
		}

		rating.ratingValue = ratingValue;
		rating.description = description;
		await rating.save();

		const message = "Updated rating";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const deleteRating = async (req, res) => {
	try {
		const ratingId = req.params.ratingId;
		const rating = await RatingModel.findById(ratingId);
		if (!rating) {
			const message = "Rating not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		await rating.delete();
		const message = "Deleted rating";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getRatingById,
	getRatingByTargetAndUser,
	getRatingsWithUserName,
	getRatings,
	addRating,
	updateRating,
	deleteRating,
};
