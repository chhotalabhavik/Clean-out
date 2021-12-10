const mongoose = require("mongoose");

const WorkerSchema = mongoose.Schema(
	{
		// worker id
		shopkeeperId: { type: mongoose.Schema.Types.ObjectId, index: true, default: null },
		profilePicture: { type: String, required: true },
		proofs: { type: mongoose.Schema.Types.Array, required: true },
		isVerified: { type: Boolean, required: true, default: false },
		isDependent: { type: String, required: true, default: false },
	},
	{ versionKey: false }
);

const WorkerModel = mongoose.model("Worker", WorkerSchema, "Worker");
WorkerModel.ensureIndexes().catch((error) => console.log(error));

module.exports = WorkerModel;
