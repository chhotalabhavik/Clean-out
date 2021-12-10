const mongoose = require("mongoose");
const ROLE = require("./Enums/ROLE");

const UserSchema = new mongoose.Schema(
	{
		// user id
		userName: { type: String, required: true },
		phone: { type: String, required: true, index: true },
		password: { type: String, required: true },
		role: { type: ROLE, required: true, default: ROLE.USER },
		OTP: { type: String, default: null },
	},
	{ versionKey: false }
);

UserSchema.index({ userName: "text" });

const UserModel = mongoose.model("User", UserSchema, "User");
UserModel.ensureIndexes().catch((error) => console.log(error));

module.exports = UserModel;
