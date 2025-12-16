import multer from "multer";
import path from "path";

// Store files in "uploads/proofs"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/proofs");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });
