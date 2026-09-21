// recipes/service.js
import recipe from './model.js';
import { createAppError } from '../middlewares/error.middleware.js';
import { saveFile, deleteFile, getPublicIdFromUrl } from '../file/upload.js';

/**
 * Вспомогательный хелпер для очистки и парсинга FormData, прилетающей с фронтенда
 */
const parseRecipeFormData = (body, file) => {
    const recipeData = { ...body };

    // Распарсиваем JSON-строки обратно в массивы
    if (typeof recipeData.ingredients === 'string') recipeData.ingredients = JSON.parse(recipeData.ingredients);
    if (typeof recipeData.steps === 'string') recipeData.steps = JSON.parse(recipeData.steps);
    if (typeof recipeData.keyWords === 'string') recipeData.keyWords = JSON.parse(recipeData.keyWords);
    if (typeof recipeData.whatProtein === 'string') recipeData.whatProtein = JSON.parse(recipeData.whatProtein);

    // Превращаем строковые флаги в реальные Boolean
    recipeData.containsProtein = recipeData.containsProtein === 'true';
    recipeData.containsFiber = recipeData.containsFiber === 'true';

    return recipeData;
};

export const recipeService = {
    // 1. Получить все рецепты
    async getAllRecipes() {
        return await recipe.find();
    },

    // 2. Получить один рецепт
    async getRecipeById(id) {
        const foundRecipe = await recipe.findById(id);
        if (!foundRecipe) {
            throw createAppError("Рецепт с указанным ID не найден", 404);
        }
        return foundRecipe;
    },

    // 3. Создать новый рецепт
    async createRecipe(body, files) {
        console.log("=== СЕРВИС: СОХРАНЕНИЕ РЕЦЕПТА ===");
        const recipeData = parseRecipeFormData(body);

        const imageFile = files && files.length > 0 ? files[0] : null;
        if (imageFile) {
            console.log(`📸 Загрузка нового файла (${imageFile.originalname}) в Cloudinary...`);
            recipeData.imgSource = await saveFile(imageFile);
        } else {
            console.warn("⚠️ Картинка отсутствует при создании рецепта!");
        }

        return await recipe.create(recipeData);
    },

    // 4. Отредактировать существующий рецепт
    async updateRecipe(id, body, files) {
        console.log("=== СЕРВИС: РЕДАКТИРОВАНИЕ РЕЦЕПТА ===");
        const updateData = parseRecipeFormData(body);

        const existingRecipe = await this.getRecipeById(id); // Используем метод выше, он сам выкинет 404 если надо

        const newImageFile = files && files.length > 0 ? files[0] : null;
        if (newImageFile) {
            console.log("🔄 Замена картинки. Удаление старой из Cloudinary...");
            if (existingRecipe.imgSource) {
                const oldPublicId = getPublicIdFromUrl(existingRecipe.imgSource);
                if (oldPublicId) await deleteFile(oldPublicId);
            }
            updateData.imgSource = await saveFile(newImageFile);
        }

        return await recipe.findByIdAndUpdate(
            id, 
            updateData, 
            { returnDocument: 'after', runValidators: true }
        );
    },

    // 5. Полностью удалить рецепт
    async removeRecipe(id) {
        const foundRecipe = await this.getRecipeById(id);

        if (foundRecipe.imgSource) {
            const publicId = getPublicIdFromUrl(foundRecipe.imgSource);
            if (publicId) {
                await deleteFile(publicId);
            }
        }

        await recipe.findByIdAndDelete(id);
        return true;
    }
};
