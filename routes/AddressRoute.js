const router = require("express").Router();
const { getAddressById } = require("../controllers/AddressController");

/**
 * GET
 */
// body -> {}
// resp -> {success, message, address}
router.use("/:userId", getAddressById);

module.exports = router;
