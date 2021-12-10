const mongoose = require("mongoose");
const handleError = require("../utilities/errorHandler");

const connectDB = async () => {
	try {
		const connection = await mongoose.connect(
			`${process.env.DB_SERVER}/${process.env.DATABASE}`,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
				useCreateIndex: true,
			}
		);
		console.log(`MongoDB connected: ${connection.connection.host}`);
	} catch (error) {
		handleError(error);
	}
};

module.exports = connectDB;
