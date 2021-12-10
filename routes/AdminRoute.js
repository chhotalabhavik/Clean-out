const router = require("express").Router();

const {
	getInitialData,
	getUsers,
	verifyServiceProvider,
	toggleCoadmin,
} = require("../controllers/AdminController");

/**
 * GET
 */
// body -> {}
// resp -> {success, message, totalUsers, totalWorkers, totalShopkeepers, totalItemOrders, totalServiceOrders}
router.get("", getInitialData);
// body -> {q:searchBy, q:searchFor, q:page, q:search, q:verification}
// resp -> {success, message, users, totalItems}
router.get("/users", getUsers);

/**
 * PUT
 */
// body -> {userId}
// resp -> {success, message}
router.put("/verify", verifyServiceProvider);
// body -> {userId}
// resp -> {success, message, role}
router.put("/toggleCoadmin", toggleCoadmin);

module.exports = router;
