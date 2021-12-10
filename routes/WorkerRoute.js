const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
	getWorkerById,
	getWorkerWithOrders,
	getRequestedOrders,
	getShopkeeperRequest,
	registerWorker,
	setShopkeeperResponse,
	updateWorker,
	removeWorker,
	leaveShop,
} = require("../controllers/WorkerController");

/**
 * GET
 */
// body -> {}
// resp -> {success, message, workerUser, address, worker:{worker, pincodes}}
router.get("/:workerId", getWorkerById);
// body -> {}
// resp -> {success, message, request}
router.get("/shopkeeperRequest/:workerId", getShopkeeperRequest);
// body -> {}
// resp -> {success, message, workerUser, address, worker, shopkeeperUser?, serviceOrders, itemOrders}
router.get("/withOrders/:workerId", getWorkerWithOrders);
// body -> {q:page}
// resp -> {success, message, orders, totalItems}
router.get("/requestedOrders/:workerId", getRequestedOrders);

/**w
 * POST
 */
// body -> {userName, phone, password, role, society, area, pincode, city, state, profilePicture, proofs, pincodes}
// resp -> {success, message, id:workerId}
router.post("", upload, registerWorker);
// body -> {response}
// resp -> {success, message, id:workerId}
router.post("/shopkeeperResponse/:workerId", setShopkeeperResponse);

/**
 * PUT
 */
// body -> {userName, phone, password, newPassword?, society, area, pincode, city, state, profilePicture?, proofs?, pincodes}
// resp -> {success, message}
router.put("/:workerId", upload, updateWorker);

/**
 * DELETE
 */
// body -> {}
// resp -> {success, message}
router.delete("/:workerId", removeWorker);
// body -> {}
// resp -> {success, message}
router.delete("/leaveShop/:workerId", leaveShop);

module.exports = router;
