const ServiceCategoryModel = require("../models/ServiceCategory");

const ServiceCategories = [
	{
		category: "Bathroom Cleaning",
		subCategories: [
			{ name: "Bathtub Cleaning", area: false, qty: true },
			{ name: "Geyser Cleaning", area: false, qty: true },
			{ name: "Wash Basin Cleaning", area: false, qty: true },
			{ name: "Ceiling Fan Cleaning", area: false, qty: true },
			{ name: "Exhaust Fan Cleaning", area: false, qty: true },
			{ name: "Toilet Cleaning", area: false, qty: true },
			{ name: "Window Cleaning", area: false, qty: true },
			{ name: "Washing Machine Cleaning", area: false, qty: true },
			{ name: "Floor Cleaning", area: true, qty: false },
		],
		image: "Bathroom.jpg",
	},
	{
		category: "Kitchen Cleaning",
		subCategories: [
			{ name: "Trolley Cleaning", area: false, qty: true },
			{ name: "Ceiling Fan Cleaning", area: false, qty: true },
			{ name: "Exhaust Fan Cleaning", area: false, qty: true },
			{ name: "Window Cleaning", area: false, qty: true },
			{ name: "Fridge Cleaning", area: false, qty: false },
			{ name: "Microwave Cleaning", area: false, qty: true },
			{ name: "Mixer Cleaning", area: false, qty: true },
			{ name: "Gas Stove Cleaning", area: false, qty: true },
			{ name: "Sink Cleaning", area: false, qty: true },
			{ name: "Floor Cleaning", area: true, qty: false },
		],
		image: "Kitchen.jpg",
	},
	{
		category: "Furniture Cleaning",
		subCategories: [
			{ name: "Cushion Cleaning", area: false, qty: true },
			{ name: "Sofa Cleaning", area: true, qty: false },
			{ name: "Carpet Cleaning", area: true, qty: false },
			{ name: "Curtain Cleaning", area: true, qty: false },
			{ name: "Dinning Table Cleaning", area: true, qty: false },
			{ name: "Mattress Cleaning", area: true, qty: false },
			{ name: "TV Cleaning", area: false, qty: true },
			{ name: "Cupboard Cleaning", area: false, qty: true },
			{ name: "Single Bed Cleaning", area: false, qty: true },
			{ name: "Double Bed Cleaning", area: false, qty: true },
			{ name: "Chair Cleaning", area: false, qty: true },
			{ name: "Tipoi Cleaning", area: false, qty: true },
		],
		image: "Furniture.jpg",
	},
	{
		category: "Room Cleaning",
		subCategories: [
			{ name: "Floor Cleaning", area: true, qty: false },
			{ name: "Single Bed Cleaning", area: false, qty: true },
			{ name: "Double Bed Cleaning", area: false, qty: true },
			{ name: "AC Cleaning", area: false, qty: true },
			{ name: "Window Cleaning", area: false, qty: true },
			{ name: "Door Cleaning", area: false, qty: true },
		],
		image: "Room.jpg",
	},
	{
		category: "Garden Cleaning",
		subCategories: [
			{ name: "Lawn Cutting", area: true, qty: false },
			{ name: "Watering", area: true, qty: false },
			{ name: "Sweeping", area: true, qty: false },
		],
		image: "Garden.jpg",
	},
	{
		category: "Vehicle Cleaning",
		subCategories: [
			{ name: "Hatchback Cleaning", area: false, qty: true },
			{ name: "Sedan Cleaning", area: false, qty: true },
			{ name: "SUV Cleaning", area: false, qty: true },
			{ name: "Minivan Cleaning", area: false, qty: true },
			{ name: "Pickup Truck Cleaning", area: false, qty: true },
			{ name: "Station Wagon Cleaning", area: false, qty: true },
			{ name: "Bicycle Cleaning", area: false, qty: true },
			{ name: "Scooter Cleaning", area: false, qty: true },
			{ name: "Motorbike Cleaning", area: false, qty: true },
		],
		image: "Vehicle.jpg",
	},
	{
		category: "Full House Cleaning",
		subCategories: [
			{ name: "1BHK Cleaning", area: false, qty: true },
			{ name: "2BHK Cleaning", area: false, qty: true },
			{ name: "3BHK Cleaning", area: false, qty: true },
			{ name: "4BHK Cleaning", area: false, qty: true },
			{ name: "5BHK Cleaning", area: false, qty: true },
			{ name: "Villa Cleaning", area: true, qty: false },
		],
		image: "FullHouse.jpg",
	},
];

const addData = async () => {
	try {
		await ServiceCategoryModel.deleteMany({});
		await ServiceCategoryModel.insertMany(ServiceCategories);
	} catch (error) {
		console.log(error);
	}
};

module.exports = addData;
