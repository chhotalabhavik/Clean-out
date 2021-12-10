const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const storage = multer.diskStorage({
	destination: "public/tempUploads",
	filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname)),
});

const allowedExt = [".png", ".jpg", ".jpeg"];
const fileFilter = (req, file, cb) => {
	const ext = path.extname(file.originalname);
	if (!allowedExt.includes(ext)) cb(new Error("Only images are allowed"));
	else cb(null, true);
};

const upload = multer({ storage, fileFilter }).fields([
	{ name: "profilePicture", maxCount: 1 },
	{ name: "proofs", maxCount: 2 },
	{ name: "itemImage", maxCount: 1 },
]);

module.exports = upload;
