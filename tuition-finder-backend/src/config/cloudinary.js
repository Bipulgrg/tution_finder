const cloudinary = require("cloudinary").v2;

const { env } = require("./env");

function configureCloudinary() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_SECRET) {
    return null;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_SECRET,
  });

  return cloudinary;
}

module.exports = { cloudinary, configureCloudinary };
