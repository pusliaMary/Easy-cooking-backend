// recipes/controller.js
import { recipeService } from './service.js';
import { catchAsync } from '../middlewares/error.middleware.js';

/**
 * 1. Получение всех рецептов
 */
export const getRecipes = catchAsync(async (req, res, next) => {
    const recipes = await recipeService.getAllRecipes();
    res.status(200).json(recipes);
});

/**
 * 2. Получение одного рецепта по ID
 */
export const getRecipeById = catchAsync(async (req, res, next) => {
    const foundRecipe = await recipeService.getRecipeById(req.params.id);
    res.status(200).json(foundRecipe);
});

/**
 * 3. Создание нового рецепта
 */
export const saveRecipe = catchAsync(async (req, res, next) => {
    const newRecipe = await recipeService.createRecipe(req.body, req.files);
    res.status(201).json(newRecipe);
});

/**
 * 4. Редактирование рецепта
 */
export const editRecipe = catchAsync(async (req, res, next) => {
    const updatedRecipe = await recipeService.updateRecipe(req.params.id, req.body, req.files);
    res.status(200).json(updatedRecipe);
});

/**
 * 5. Удаление рецепта
 */
export const deleteRecipe = catchAsync(async (req, res, next) => {
    await recipeService.removeRecipe(req.params.id);
    res.status(200).json({ 
        success: true, 
        message: 'Рецепт и его облачное изображение успешно удалены' 
    });
});
