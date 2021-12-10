const router = require("express").Router();
const {
	getServiceOrder,
	doneOrder,
	cancelOrder,
	replaceOrder,
} = require("../controllers/ServiceOrderController");

/**
 * GET
 */
// body -> {}
// resp -> {success, message, serviceOrder, user, address, workerUser, worker, service, workerService}
router.get("/:serviceOrderId", getServiceOrder);

/**
 * POST
 */
// body -> {}
// resp -> {success, message, id:newOrderId}
router.post("/:serviceOrderId", replaceOrder);

/**
 * PUT
 */
// body -> {}
// resp -> {success, message}
router.put("/:serviceOrderId", doneOrder);

/**
 * DELETE
 */
// body -> {}
// resp -> {success, message}
router.delete("/:serviceOrderId", cancelOrder);

module.exports = router;
