require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_LINK;

async function run() {
  const CLIENT = new MongoClient(MONGO_URI);
  try {
    await CLIENT.connect();
    console.log('🚀 Подключились к MongoDB Atlas успешно!');

    const db = CLIENT.db(); 
    const collection = db.collection('recipes');

    const recipes = await collection.find({}).toArray();
    console.log('🔍 Проверяем рецепты в базе. Всего: ' + recipes.length);

    let restoredCount = 0;

        for (const recipe of recipes) {
      const currentUrl = recipe.imgSource || '';
      const title = recipe.title || 'food';

      if (currentUrl.includes('unsplash.com')) {
        // 1. Отсекаем параметры после знака "?"
        const cleanPath = currentUrl.split('?')[0]; 

        // 2. Разбиваем строку по слэшам "/"
        const urlParts = cleanPath.split('/'); 

        // 3. Берем самый последний элемент массива (это гарантированно будут только цифры ID)
        const pureId = urlParts[urlParts.length - 1]; 

        if (pureId && pureId.length > 5) {
          // 4. Собираем идеальную ссылку с правильным доменом и префиксом
          const correctUrl = 'https://images.unsplash.com/photo-' + pureId + '?auto=format&fit=crop&w=1200&q=80';

          // Обновляем базу данных
          await collection.updateOne(
            { _id: recipe._id },
            { $set: { imgSource: correctUrl } }
          );

          console.log('✅ Идеально собран URL для: ' + title + ' -> ' + correctUrl);
        }
      }
    }

    console.log('\n🎉 База данных полностью обновлена! Изменено документов: ' + restoredCount);

  } catch (error) {
    console.error('❌ Ошибка во время выполнения:', error);
  } finally {
    await CLIENT.close();
  }
}

run();
