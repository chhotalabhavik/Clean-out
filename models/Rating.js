const mongoose = require("mongoose");

const RatingSchema = mongoose.Schema(
	{
		// rating id
		userId: { type: mongoose.Schema.Types.ObjectId, required: true },
		targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
		ratingValue: { type: Number, required: true },
		description: { type: String, default: "" },
	},
	{ versionKey: false }
);

RatingSchema.index({ targetId: 1, userId: 1 }, { unique: true });

const RatingModel = mongoose.model("Rating", RatingSchema, "Rating");
RatingModel.ensureIndexes().catch((error) => console.log(error));

module.exports = RatingModel;
