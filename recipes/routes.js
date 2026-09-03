const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  getRecipes,
  saveRecipe,
  deleteRecipe,
  editRecipe,
} = require("./controller");
const { authenticate } = require('../auth/auth.middleware');


const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });
const router = Router();

router.get("/", getRecipes);                           
router.post("/", authenticate, saveRecipe);
router.delete("/:id", authenticate, deleteRecipe);
router.put("/:id", authenticate, editRecipe);

router.post("/uploadImage", authenticate, upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        return res.status(200).json({ url: fileUrl });
    } catch (err) {
        console.error("Image upload router error:", err);
        return res.status(500).json({ message: "Failed to upload image to server" });
    }
});

module.exports = router;
