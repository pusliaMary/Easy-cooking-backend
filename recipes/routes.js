const { Router } = require("express");
const {
  getRecipes,
  saveRecipe,
  deleteRecipe,
  editRecipe,
} = require("./controller");
const { authenticate } = require('../auth/auth.middleware')


const router = Router();

router.get("/", getRecipes);                           
router.post("/saveRecipe", authenticate, saveRecipe);
router.delete("/deleteRecipe", authenticate, deleteRecipe);
router.put("/editRecipe", authenticate, editRecipe);

 

module.exports = router;



// Configure where to save uploaded images locally
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure an 'uploads' folder exists in your backend root folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Saves as: 1718292922-38492.jpg
  }
});

const upload = multer({ storage: storage });

router.get("/", getRecipes);                           
router.post("/", authenticate, saveRecipe);
router.delete("/:id", authenticate, deleteRecipe);
router.put("/:id", authenticate, editRecipe);

// FIXED: Added the missing image upload endpoint path
// 'image' must match the field name appended in your frontend FormData: fileData.append("image", targetFile);
router.post("/uploadImage", authenticate, upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        // Construct the accessible public URL for your frontend
        // Example: https://onrender.com
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        return res.status(200).json({ url: fileUrl });
    } catch (err) {
        console.error("Image upload router error:", err);
        return res.status(500).json({ message: "Failed to upload image to server" });
    }
});

module.exports = router;
