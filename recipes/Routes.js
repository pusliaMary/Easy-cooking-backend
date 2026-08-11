const { Router } = require("express");
const {
  getRecipes,
  saveRecipe,
  deleteRecipe,
  editRecipe,
} = require("./controllers");
const { authenticate } = require('../auth/auth.middleware')


const router = Router();

router.get("/", getRecipes);
router.post("/saveRecipe", saveRecipe);
router.delete("/deleteRecipe", deleteRecipe);
router.put("/editRecipe", editRecipe);

module.exports = router;
