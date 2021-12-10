const router = require("express").Router();
const {
	getService,
	getWorkerServiceWithRatings,
	getServiceCount,
	getServices,
	getOnlyWorkerService,
	getWorkerServicesForStore,
	addService,
	updateService,
	deleteService,
	bookService,
} = require("../controllers/ServiceController");

/**
 * GET
 */
// body -> {q:pincode q:subCategories, q:sortBy, q:page, q:serviceCategory}
// resp -> {success, message, services, totalItems}
router.get("/store", getWorkerServicesForStore);
// body -> {q:workerId, q:serviceId}
// resp -> {success, message, workerService}
router.get("/onlyWorkerService", getOnlyWorkerService);
// body -> {}
// resp -> {success, message, service}
router.get("/:serviceId", getService);
// body -> {}
// resp -> {success, message, service, workerUser, worker, workerService, ratings}
router.get("/workerService/:workerServiceId", getWorkerServiceWithRatings);
// body -> {}
// resp -> {success, message, serviceCount}
router.get("/count/:serviceProviderId", getServiceCount);
// body -> {q:page}
// resp -> {success, message, services, totalItems}
router.get("/services/:serviceProviderId", getServices);

/**
 * POST
 */
// body -> {serviceName, price, maxSquareFeet, serviceCategory, subCategory, description}
// resp -> {success, message, id:serviceId}
router.post("/:serviceProviderId", addService);
// body -> {userId, price, metaData}
// resp -> {success, message, id:serviceOrderId}
router.post("/bookService/:workerServiceId", bookService);

/**
 * PUT
 */
// body -> {serviceName, price, maxSquareFeet, serviceCategory, subCategory, description}
// resp -> {success, message}
router.put("/:serviceId", updateService);

/**
 * DELETE
 */
// body -> {}
// resp -> {success, message}
router.delete("/:serviceId", deleteService);

module.exports = router;
