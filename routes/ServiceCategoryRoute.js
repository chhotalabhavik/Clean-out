const router = require("express").Router();
const upload = require("../config/multerAdminConfig");
const {
	getServiceCategories,
	getServiceCategory,
	addServiceCategory,
	updateServiceCategory,
	removeServiceCategory,
} = require("../controllers/ServiceCategoryController");

/**
 * GET
 */
// body -> {}
// response -> {success, message, categories}
router.get("", getServiceCategories);
// body -> {}
// response -> {success, message, category}
router.get("/:serviceCategoryId", getServiceCategory);

/**
 * POST
 */
// body -> {category, subCategories, image}
// response -> {success, message, id:serviceCategoryId}
router.post("", upload, addServiceCategory);

/**
 * PUT
 */
// body -> {category, subCategories, image?}
// response -> {success, message}
router.put("/:serviceCategoryId", upload, updateServiceCategory);

/**
 * DELETE
 */
// body -> {}
// response -> {success, message}
router.delete("/:serviceCategoryId", removeServiceCategory);

module.exports = router;
