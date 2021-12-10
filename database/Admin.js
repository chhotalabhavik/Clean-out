const mongoose = require("mongoose");
const UserModel = require("../models/User");
const AddressModel = require("../models/Address");
const ROLE = require("../models/Enums/ROLE");
const encrypt = require("../utilities/encrypt");

const _id = mongoose.Types.ObjectId();
const admin = new UserModel(
	Object.fromEntries(
		new Map(
			process.env.ADMIN.split(";")
				.map((str) => str.trim().split(":"))
				.map((arr) => [arr[0], arr[1].trim()])
		)
	)
);

const address = new AddressModel(
	Object.fromEntries(
		new Map(
			process.env.ADMIN_ADDRESS.split(";")
				.map((str) => str.trim().split(":"))
				.map((arr) => [arr[0], arr[1].trim()])
		)
	)
);

module.exports = addAdmin;

async function addAdmin() {
	admin.role = ROLE.ADMIN;
	admin.password = await encrypt(admin.password);
	if (await UserModel.findOne({ phone: admin.phone })) return;
	else {
		admin._id = address._id = _id;
		await Promise.all([admin.save(), address.save()]);
	}
}
