import recipe from './model.js';
import { catchAsync, createAppError } from '../middlewares/error.middleware.js';
import { saveFile, deleteFile, getPublicIdFromUrl } from '../file/upload.js';

/* 1. Получение всех рецептов/ try-catch убран. Ошибки подключения к БД перехватит errorHandler (статус 500) */
export const getRecipes = catchAsync(async (req, res, next) => {
    const recipes = await recipe.find();
    res.status(200).send(recipes);
});

/* 2. Получение одного рецепта по ID/ Ручная проверка валидности ID удалена, так как Mongoose CastError теперь обрабатывается автоматически*/
export const getRecipeById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const foundRecipe = await recipe.findById(id);
    if (!foundRecipe) {
        return next(createAppError("Рецепт с указанным ID не найден", 404));
    }
    
    res.status(200).send(foundRecipe);
});

/* 3. Создание нового рецепта с автоматической отправкой в Cloudinary/ Ошибки JSON.parse и валидации схемы схемы (меньше 3 ингредиентов и т.д.) вернут статус 400 */
export const saveRecipe = catchAsync(async (req, res, next) => {
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

    // Ищем файл картинки
    const imageFile = req.files && req.files.length > 0 ? req.files[0] : null;
    
    if (imageFile) {
        console.log(`📸 Файл обнаружен (${imageFile.originalname}). Отправка в Cloudinary...`);
        recipeData.imgSource = await saveFile(imageFile);
        console.log(`🔗 Ссылка от Cloudinary получена: ${recipeData.imgSource}`);
    } else {
        console.warn("⚠️ Картинка не найдена в req.files!");
    }

    const data = await recipe.create(recipeData);
    console.log("✅ Рецепт успешно добавлен в MongoDB со ссылкой на Cloudinary!");
    res.status(201).send(data);
});

/*4. Редактирование рецепта с заменой старой картинки в Cloudinary */
export const editRecipe = catchAsync(async (req, res, next) => {
    console.log("=== ДАННЫЕ С ФРОНТЕНДА (РЕДАКТИРОВАНИЕ) ===");
    const { id } = req.params; 
    const updateData = { ...req.body };

    if (typeof updateData.ingredients === 'string') updateData.ingredients = JSON.parse(updateData.ingredients);
    if (typeof updateData.steps === 'string') updateData.steps = JSON.parse(updateData.steps);
    if (typeof updateData.keyWords === 'string') updateData.keyWords = JSON.parse(updateData.keyWords);
    if (typeof updateData.whatProtein === 'string') updateData.whatProtein = JSON.parse(updateData.whatProtein);

    updateData.containsProtein = updateData.containsProtein === 'true';
    updateData.containsFiber = updateData.containsFiber === 'true';

    const existingRecipe = await recipe.findById(id);
    if (!existingRecipe) {
        return next(createAppError('Рецепт для редактирования не найден в базе данных', 404));
    }

    const newImageFile = req.files && req.files.length > 0 ? req.files[0] : null;
    
    if (newImageFile) {
        console.log("🔄 Замена картинки. Удаление старой из Cloudinary...");
        if (existingRecipe.imgSource) {
            const oldPublicId = getPublicIdFromUrl(existingRecipe.imgSource);
            if (oldPublicId) await deleteFile(oldPublicId);
        }
        updateData.imgSource = await saveFile(newImageFile);
    }

    // runValidators: true гарантирует, что новые массивы проверятся на лимиты (>=3 ингредиентов и т.д.)
    const updatedData = await recipe.findByIdAndUpdate(
        id, 
        updateData, 
        { returnDocument: 'after', runValidators: true }
    );

    res.status(200).send(updatedData);
});

/*5. Удаление рецепта и его картинки из Cloudinary */
export const deleteRecipe = catchAsync(async (req, res, next) => {
    const { id } = req.params; 

    const foundRecipe = await recipe.findById(id);
    if (!foundRecipe) {
        return next(createAppError('Рецепт с указанным ID не найден в базе данных', 404));
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
    
    res.status(200).json({ 
        success: true, 
        message: 'Рецепт и его облачное изображение успешно удалены' 
    });
});
