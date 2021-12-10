const router = require("express").Router();
const {
	getUserById,
	getUserWithOrders,
	getUserByPhone,
	registerUser,
	updateUser,
	removeUser,
	resetPassword,
} = require("../controllers/UserController");

/**
 * GET
 */
// body -> {q:phone}
// resp -> {success, message, user, address}
router.get("/phone", getUserByPhone);
// body -> {}
// resp -> {success, message, user, address}
router.get("/:userId", getUserById);
// body -> {}
// resp -> {success, message, user, address, serviceOrders, itemOrders}
router.get("/withOrders/:userId", getUserWithOrders);

/**
 * POST
 */
// body -> {userName, phone, password, role, society, area, pincode, city, state}
// resp -> {success, message, id:userId}
router.post("", registerUser);
// body -> {phone, password}
// resp -> {success, message}
router.post("/resetPassword", resetPassword);

/**
 * PUT
 */
// body -> {userName, phone, password, role, society, area, pincode, city, state}
// resp -> {success, message, id:userId}
router.put("/:userId", updateUser);

/**
 * DELETE
 */
// body -> {}
// resp -> {success, message}
router.delete("/:userId", removeUser);

module.exports = router;
