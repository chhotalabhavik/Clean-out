const ServiceCategoryModel = require("../models/ServiceCategory");
const handleError = require("../utilities/errorHandler");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");
const { deleteFiles, renameFile } = require("../utilities/FileHandlers");

const getServiceCategories = async (req, res) => {
	try {
		const categories = await ServiceCategoryModel.find();
		const message = "Found service categories";
		res.json(new Response(RESPONSE.SUCCESS, { message, categories }));
	} catch (error) {
		handleError(error);
	}
};

const getServiceCategory = async (req, res) => {
	try {
		const serviceCategoryId = req.params.serviceCategoryId;
		const serviceCategory = await ServiceCategoryModel.findById(serviceCategoryId);
		if (!serviceCategory) {
			const message = "Service category not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		const message = "Found service category";
		res.json(new Response(RESPONSE.SUCCESS, { message, serviceCategory }));
	} catch (error) {
		handleError(error);
	}
};

const addServiceCategory = async (req, res) => {
	try {
		let { category, subCategories } = req.body;
		const image = req.files.image[0].filename;
		subCategories = JSON.parse(subCategories);

		const serviceCategory = new ServiceCategoryModel({ category, subCategories, image });
		await serviceCategory.save();

		const message = "Service category added";
		res.json(new Response(RESPONSE.SUCCESS, { message, id: serviceCategory._id }));
	} catch (error) {
		handleError(error);
	}
};

const updateServiceCategory = async (req, res) => {
	try {
		const serviceCategoryId = req.params.serviceCategoryId;
		let serviceCategory = await ServiceCategoryModel.findById(serviceCategoryId);
		if (!serviceCategory) {
			const message = "Service category not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		let { category, subCategories } = req.body;
		let image = req.files.image;
		subCategories = JSON.parse(subCategories);

		const isCategoryChanged = category !== serviceCategory.category;
		serviceCategory.category = category;
		serviceCategory.subCategories = subCategories;

		if (isCategoryChanged) {
			if (image) {
				await deleteFiles([serviceCategory.image]);
				serviceCategory.image = image[0].filename;
			} else {
				const mime = serviceCategory.image.split(".")[1];
				const name =
					category
						.split(" ")
						.map((val) => val.trim())
						.join("") +
					"." +
					mime;

				renameFile(serviceCategory.image, name);
				serviceCategory.image = name;
			}
		}

		await serviceCategory.save();
		const message = "Service category changed";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

const removeServiceCategory = async (req, res) => {
	try {
		const serviceCategoryId = req.params.serviceCategoryId;
		const serviceCategory = await ServiceCategoryModel.findById(serviceCategoryId);
		if (!serviceCategory) {
			const message = "Service category not found";
			return res.json(new Response(RESPONSE.FAILURE, { message }));
		}

		await Promise.all([deleteFiles([serviceCategory.image]), serviceCategory.delete()]);

		const message = "Service category deleted";
		res.json(new Response(RESPONSE.SUCCESS, { message }));
	} catch (error) {
		handleError(error);
	}
};

module.exports = {
	getServiceCategories,
	getServiceCategory,
	addServiceCategory,
	updateServiceCategory,
	removeServiceCategory,
};
