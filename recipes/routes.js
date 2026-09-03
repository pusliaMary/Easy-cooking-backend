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
