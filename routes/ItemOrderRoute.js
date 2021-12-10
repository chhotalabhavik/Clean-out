const router = require("express").Router();
const {
	getItemOrder,
	replaceItemOrder,
	changeItemOrderStatus,
	cancelItemOrderPack,
} = require("../controllers/ItemOrderController");

/**
 * GET
 */
// body -> {q:userId}
// resp -> {success, message, user?, address?, itemOrder?, orderItemPacks}
router.get("/:orderId", getItemOrder);

/**
 * POST
 */
// body -> {}
// resp -> {success, message, id:newOrderId}
router.post("/:orderId", replaceItemOrder);

/**
 * PUT
 */
// body -> {userId}
// resp -> {success, message}
router.put("/:orderItemPackId", changeItemOrderStatus);

/**
 * DELETE
 */
// body -> {userId}
// resp -> {success, message}
router.delete("/:orderItemPackId", cancelItemOrderPack);

module.exports = router;
