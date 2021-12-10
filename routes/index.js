const router = require("express").Router();

router.use("/otp", require("./OtpRoute"));
router.use("/jwt", require("./JwtRoute"));
router.use("/user", require("./UserRoute"));
router.use("/auth", require("./AuthRoute"));
router.use("/test", require("./TestRoute"));
router.use("/item", require("./ItemRoute"));
router.use("/cart", require("./CartRoute"));
router.use("/admin", require("./AdminRoute"));
router.use("/worker", require("./WorkerRoute"));
router.use("/rating", require("./RatingRoute"));
router.use("/address", require("./AddressRoute"));
router.use("/service", require("./ServiceRoute"));
router.use("/itemOrder", require("./ItemOrderRoute"));
router.use("/shopkeeper", require("./ShopkeeperRoute"));
router.use("/serviceOrder", require("./ServiceOrderRoute"));
router.use("/serviceCategory", require("./ServiceCategoryRoute"));

module.exports = router;
