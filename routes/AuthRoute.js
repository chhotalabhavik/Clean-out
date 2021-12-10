const router = require("express").Router();
const { loginUser, logoutUser } = require("../controllers/AuthController");
const { ifLogin } = require("../middlewares/auth");

/**
 * POST
 */
// body -> {phone, password}
// resp -> {success, message}
router.post("/login", loginUser);
// body -> {}
// resp -> {success, message}
router.post("/logout", ifLogin, logoutUser);

module.exports = router;
