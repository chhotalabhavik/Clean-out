const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
	getShopkeeperById,
	getShopkeeperWithOrders,
	getWorkers,
	getRequestedOrders,
	registerShopkeeper,
	addWorker,
	updateShopkeeper,
	removeShopkeeper,
	removeWorkerFromShop,
} = require("../controllers/ShopkeeperController");

/**
 * GET
 */
// body -> {}
// resp -> {success, message, shopkeeperUser, address, shopkeeper}
router.get("/:shopkeeperId", getShopkeeperById);
// body -> {}
// resp -> {success, message, shopkeeperUser, address, shopkeeper, serviceOrders, itemOrders}
router.get("/withOrders/:shopkeeperId", getShopkeeperWithOrders);
// body -> {q:page}
// resp -> {success, message, workers, totalItems}
router.get("/workers/:shopkeeperId", getWorkers);
// body -> {q:page}
// resp -> {success, message, orders, totalItems}
router.get("/requestedOrders/:shopkeeperId", getRequestedOrders);

/**
 * POST
 */
// body -> {userName, phone, password, role, society, area, pincode, city, state, shopName, proofs}
// resp -> {success, message, id:shopkeeperId}
router.post("", upload, registerShopkeeper);
// body -> {phone}
// resp -> {success, message}
router.post("/addWorker/:shopkeeperId", addWorker);

/**
 * PUT
 */
// body -> {userName, phone, password, newPassword, society, area, pincode, city, state, shopName, proofs?}
// resp -> {success, message}
router.put("/:shopkeeperId", upload, updateShopkeeper);

/**
 * DELETE
 */
// body -> {}
// resp -> {success, message}
router.delete("/:shopkeeperId", removeShopkeeper);
// body -> {q:workerId}
// resp -> {success, message}
router.delete("/worker/:shopkeeperId", removeWorkerFromShop);

module.exports = router;
