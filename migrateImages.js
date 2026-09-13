require('dotenv').config();
const mongoose = require('mongoose');
const sharp = require('sharp');
const cloudinary = require('./file/cloudinary'); 
const Recipe = require('./recipes/model');

const MONGO_URI = process.env.MONGODB_LINK;
const TARGET_FOLDER = 'recipes-uploads';

async function migrate() {
    try {
        console.log('🔄 Подключение к MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Успешно подключено к базе данных.');

        const recipes = await Recipe.find();
        
        // Берем все рецепты с непустыми ссылками
        const recipesToMigrate = recipes.filter(r => r.imgSource);

        console.log(`📊 Всего рецептов в базе: ${recipes.length}`);
        console.log(`🚀 Найдено рецептов для принудительного переноса в папку: ${recipesToMigrate.length}`);

        for (let i = 0; i < recipesToMigrate.length; i++) {
            const recipe = recipesToMigrate[i];
            console.log(`\n[${i + 1}/${recipesToMigrate.length}] Перенос рецепта: "${recipe.title}"`);
            
            if (!recipe.imgSource || typeof recipe.imgSource !== 'string' || !recipe.imgSource.startsWith('http')) {
                console.error(`   ❌ Пропуск: некорректная ссылка или пустое поле imgSource`);
                continue;
            }

            // Переменная для хранения ссылки, которую мы будем загружать
            let urlToUpload = recipe.imgSource;

            try {
                console.log(`   ☁️  Загрузка напрямую в папку "${TARGET_FOLDER}"...`);
                
                const safeTitle = recipe.title
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-zA-Z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .toLowerCase();

                let cloudinaryResult;
                
                try {
                    // Первая попытка: Пробуем загрузить текущую ссылку из базы
                    cloudinaryResult = await cloudinary.uploader.upload(urlToUpload, {
                        folder: TARGET_FOLDER, 
                        public_id: `${TARGET_FOLDER}/${Date.now()}-${safeTitle}`,
                        resource_type: 'image',
                        fetch_format: 'webp',
                        transformation: [{ width: 1280, crop: "limit", quality: 70 }]
                    });
                } catch (uploadError) {
                    // ВТОРОЙ ШАНС: Если картинка была удалена (Resource not found), генерируем красивый плейсхолдер с текстом!
                    if (uploadError.message && uploadError.message.includes('Resource not found')) {
                        console.warn(`   ⚠️  Старая картинка не найдена в облаке. Создаем красивый плейсхолдер...`);
                        
                        // Генерируем ссылку на красивую заглушку с названием блюда (например, "Classic+Chicken+Caesar+Salad")
                        const encodedText = encodeURIComponent(recipe.title);
                        urlToUpload = `https://placehold.co{encodedText}`;
                        
                        // Загружаем этот плейсхолдер в Cloudinary
                        cloudinaryResult = await cloudinary.uploader.upload(urlToUpload, {
                            folder: TARGET_FOLDER, 
                            public_id: `${TARGET_FOLDER}/${Date.now()}-${safeTitle}`,
                            resource_type: 'image',
                            fetch_format: 'webp',
                            transformation: [{ width: 1280, crop: "limit", quality: 70 }]
                        });
                    } else {
                        // Если ошибка какая-то другая (например, ключи неверные), пробрасываем её дальше
                        throw uploadError;
                    }
                }

                // Перезаписываем путь в Монге на новую правильную ссылку внутри папки
                recipe.imgSource = cloudinaryResult.secure_url;
                await recipe.save();

                console.log(`   ✅ УСПЕШНО! Картинка в папке. Новый URL: ${recipe.imgSource}`);

                // Небольшой таймаут между итерациями, чтобы разгрузить лимиты API
                await new Promise(res => setTimeout(res, 500));

            } catch (recipeError) {
                console.error(`   ❌ Ошибка при обработке рецепта "${recipe.title}":`, recipeError.message);
            }
        }

        console.log('\n🏁 Миграция в папку успешно завершена!');
        process.exit(0);

    } catch (globalError) {
        console.error('💥 Критическая ошибка миграции:', globalError);
        process.exit(1);
    }
}

migrate();
