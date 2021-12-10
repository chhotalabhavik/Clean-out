const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
	destination: "public/uploads",
	filename: (req, file, cb) => cb(null, file.originalname),
});

const allowedExt = [".png", ".jpg", ".jpeg"];
const fileFilter = (req, file, cb) => {
	const ext = path.extname(file.originalname);
	if (!allowedExt.includes(ext)) cb(new Error("Only images are allowed"));
	else cb(null, true);
};

const upload = multer({ storage, fileFilter }).fields([{ name: "image", maxCount: 1 }]);

module.exports = upload;
