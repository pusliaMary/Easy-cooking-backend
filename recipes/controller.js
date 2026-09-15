import recipe from './model.js';
import mongoose from 'mongoose'; 
import { saveFile, deleteFile, getPublicIdFromUrl } from '../file/upload.js';

/**
 * 1. Получение всех рецептов
 */
export const getRecipes = async (req, res) => {
    try {
        const recipes = await recipe.find();
        res.status(200).send(recipes);
    } catch (err) {
        res.status(500).send({ error: "Ошибка при получении рецептов" });
    }
};

/**
 * 2. Получение одного рецепта по ID
 */
export const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: "Некорректный формат ID рецепта" });
        }
        const foundRecipe = await recipe.findById(id);
        if (!foundRecipe) {
            return res.status(404).send({ error: "Рецепт с указанным ID не найден" });
        }
        res.status(200).send(foundRecipe);
    } catch (err) {
        console.error("Error getting recipe by id:", err.message);
        res.status(500).send({ error: "Ошибка при получении данных рецепта" });
    }
};

/**
 * 3. Создание нового рецепта с автоматической отправкой в Cloudinary
 */
export const saveRecipe = async (req, res) => {
    try {
        console.log("=== ДАННЫЕ С ФРОНТЕНДА (СОХРАНЕНИЕ) ===");
        const recipeData = { ...req.body };

        // Распарсиваем JSON-строки от FormData обратно в массивы
        if (typeof recipeData.ingredients === 'string') recipeData.ingredients = JSON.parse(recipeData.ingredients);
        if (typeof recipeData.steps === 'string') recipeData.steps = JSON.parse(recipeData.steps);
        if (typeof recipeData.keyWords === 'string') recipeData.keyWords = JSON.parse(recipeData.keyWords);
        if (typeof recipeData.whatProtein === 'string') recipeData.whatProtein = JSON.parse(recipeData.whatProtein);

        // Превращаем строковые 'true'/'false' от FormData в реальные Boolean
        recipeData.containsProtein = recipeData.containsProtein === 'true';
        recipeData.containsFiber = recipeData.containsFiber === 'true';

        // Ищем файл картинки (multer кладет первый файл в req.files при upload.any())
        const imageFile = req.files && req.files.length > 0 ? req.files[0] : null;
        
        if (imageFile) {
            console.log(`📸 Файл обнаружен (${imageFile.originalname}). Отправка в Cloudinary...`);
            // Обязательно дожидаемся окончания загрузки
            recipeData.imgSource = await saveFile(imageFile);
            console.log(`🔗 Ссылка от Cloudinary получена: ${recipeData.imgSource}`);
        } else {
            console.warn("⚠️ Картинка не найдена в req.files!");
        }

        const data = await recipe.create(recipeData);
        console.log("✅ Рецепт успешно добавлен в MongoDB со ссылкой на Cloudinary!");
        res.status(201).send(data);
    } catch (err) {
        console.log("💥 Ошибка при создании рецепта:", err.message);
        res.status(400).send({ error: err.message });
    }
};

/**
 * 4. Редактирование рецепта с заменой старой картинки в Cloudinary
 */
export const editRecipe = async (req, res) => {
    try {
        console.log("=== ДАННЫЕ С ФРОНТЕНДА (РЕДАКТИРОВАНИЕ) ===");
        const { id } = req.params; 
        const updateData = { ...req.body };
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Некорректный формат ID рецепта' });
        }

        if (typeof updateData.ingredients === 'string') updateData.ingredients = JSON.parse(updateData.ingredients);
        if (typeof updateData.steps === 'string') updateData.steps = JSON.parse(updateData.steps);
        if (typeof updateData.keyWords === 'string') updateData.keyWords = JSON.parse(updateData.keyWords);
        if (typeof updateData.whatProtein === 'string') updateData.whatProtein = JSON.parse(updateData.whatProtein);

        updateData.containsProtein = updateData.containsProtein === 'true';
        updateData.containsFiber = updateData.containsFiber === 'true';

        const existingRecipe = await recipe.findById(id);
        if (!existingRecipe) {
            return res.status(404).send({ error: 'Recipe not found' });
        }

        const newImageFile = req.files && req.files.length > 0 ? req.files[0] : null;
        
        if (newImageFile) {
            console.log("🔄 Замена картинки. Удаление старой из Cloudinary...");
            if (existingRecipe.imgSource) {
                const oldPublicId = getPublicIdFromUrl(existingRecipe.imgSource);
                if (oldPublicId) await deleteFile(oldPublicId);
            }
            // Дожидаемся загрузки новой картинки
            updateData.imgSource = await saveFile(newImageFile);
        }

        const updatedData = await recipe.findByIdAndUpdate(
            id, 
            updateData, 
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).send(updatedData);
    } catch (err) {
        console.log("💥 Ошибка при обновлении рецепта:", err.message);
        res.status(400).send({ error: err.message });
    }
};

/**
 * 5. Удаление рецепта и его картинки из Cloudinary
 */
export const deleteRecipe = async (req, res, next) => {
    try {
        const { id } = req.params; 

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400);
            throw new Error('Передан некорректный формат ID (Invalid ObjectId)');
        }

        const foundRecipe = await recipe.findById(id);
        if (!foundRecipe) {
            res.status(404);
            throw new Error('Рецепт с указанным ID не найден в базе данных');
        }

        // Извлекаем publicId и удаляем картинку из Cloudinary перед тем, как стереть сам рецепт
        if (foundRecipe.imgSource) {
            const publicId = getPublicIdFromUrl(foundRecipe.imgSource);
            if (publicId) {
                await deleteFile(publicId);
            }
        }

        // Удаляем запись из MongoDB
        await recipe.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'Recipe and its cloud image successfully deleted' });

    } catch (err) {
        next(err); 
    }
};
