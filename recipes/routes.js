const { Router } = require("express");
const {
  getRecipes,
  saveRecipe,
  deleteRecipe,
  editRecipe,
  getRecipeById,
} = require("./controller");
const { authenticate } = require('../auth/auth.middleware');
const createStorage = require('../file/uploadMiddleware'); // Импортируем вашу мидлвару для загрузки

const upload = createStorage(); // Инициализируем multer
const router = Router();

// Публичные эндпоинты (доступны всем пользователям)
router.get("/", getRecipes);
router.get("/:id", getRecipeById);

// Приватные эндпоинты (требуют авторизации и обрабатывают FormData с файлами)
router.post("/", authenticate, upload.any(), saveRecipe);
router.put("/:id", authenticate, upload.any(), editRecipe);
router.delete("/:id", authenticate, deleteRecipe);

module.exports = router;
