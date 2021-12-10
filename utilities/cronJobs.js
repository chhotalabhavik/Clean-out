const cron = require("cron");
const moment = require("moment");

const ServiceOrderModel = require("../models/ServiceOrder");
const NOTIFICATION = require("../models/Enums/NOTIFICATION");

const { sendNotifications } = require("./notifications");

module.exports = startJobs;

const reminder = cron.job("0 7 * * * *", async () => {
	const lastMonthDate = new Date();
	lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
	const lastMonthDateISO = moment(lastMonthDate).format(process.env.DATE_FORMAT);

	const pipeline = [
		{ $match: { placedDate: lastMonthDateISO } },
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
			$lookup: {
				from: "Service",
				localField: "serviceId",
				foreignField: "_id",
				as: "service",
			},
		},
		{ $unwind: "$service" },
		{
			$project: {
				userName: "$user.userName",
				phone: "$user.phone",
				serviceName: "$service.serviceName",
				serviceCategory: "$service.serviceCategory",
			},
		},
	];

	const users = await ServiceOrderModel.aggregate(pipeline);
	users.forEach((user) => {
		const message = `Dear ${user.userName}, it's been one month since you booked service ${user.serviceName} [${user.serviceCategory}]`;
		sendNotifications(message, [user.phone], NOTIFICATION.REMINDER);
	});
});

function startJobs() {
	reminder.start();
}
