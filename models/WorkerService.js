const mongoose = require("mongoose");

const WorkerServiceSchema = new mongoose.Schema(
	{
		//workerServiceId
		workerId: { type: mongoose.Schema.Types.ObjectId, required: true },
		serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
		ratingValue: { type: Number, required: true, default: process.env.DEFAULT_RATING },
		ratingCount: { type: Number, required: true, default: 0 },
		orderedCount: { type: Number, required: true, default: 0 },
	},
	{ versionKey: false }
);

WorkerServiceSchema.index({ workerId: 1, serviceId: 1 }, { unique: true });

const WorkerServiceModel = mongoose.model("WorkerService", WorkerServiceSchema, "WorkerService");
WorkerServiceModel.ensureIndexes().catch(console.log);

module.exports = WorkerServiceModel;
