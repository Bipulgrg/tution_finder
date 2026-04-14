const multer = require("multer");

const { configureCloudinary, cloudinary } = require("../config/cloudinary");
const { ApiError } = require("../utils/apiError");

configureCloudinary();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new ApiError(400, "VALIDATION_ERROR", "Only image uploads allowed"));
    }
    return cb(null, true);
  },
});

async function uploadToCloudinary(buffer, folder) {
  if (!cloudinary.config().cloud_name) {
    throw new ApiError(500, "INTERNAL_ERROR", "Cloudinary not configured");
  }

  const base64 = buffer.toString("base64");
  const dataUri = `data:image/jpeg;base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
  });

  return result.secure_url;
}

module.exports = { upload, uploadToCloudinary };
