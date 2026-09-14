import { Router } from "express";
import {
  getRecipes,
  saveRecipe,
  deleteRecipe,
  editRecipe,
  getRecipeById,
} from "./controller.js";
import { authenticate } from '../auth/auth.middleware.js';
import createStorage from '../file/uploadMiddleware.js';

const upload = createStorage();
const router = Router();

router.get("/", getRecipes);
router.get("/:id", getRecipeById);


router.post("/", authenticate, upload.any(), saveRecipe);
router.put("/:id", authenticate, upload.any(), editRecipe);
router.delete("/:id", authenticate, deleteRecipe);

export default router;

