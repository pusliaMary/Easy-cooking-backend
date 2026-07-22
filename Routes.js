const { Router } = require('express')
const { getRecipe, saveRecipe, deleteRecipe, editRecipe } = require('./Controllers')

const router = Router()

router.get('/', getRecipe)
router.post('/saveRecipe', saveRecipe)
router.delete('/deleteRecipe', deleteRecipe)
router.put('/editRecipe', editRecipe)

module.exports = router