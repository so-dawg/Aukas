const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (_req, file) => {
    const baseName = path
      .parse(file.originalname || "cv")
      .name.replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 80);

    return {
      folder: "aukas_cv",
      resource_type: "raw", // PDF is stored as a raw asset in Cloudinary
      format: "pdf",
      public_id: `${Date.now()}-${baseName || "cv"}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfExt = path.extname(file.originalname || "").toLowerCase() === ".pdf";
    if (!isPdfMime && !isPdfExt) {
      return cb(new Error("Only PDF files are allowed."));
    }
    cb(null, true);
  },
});

module.exports = upload;