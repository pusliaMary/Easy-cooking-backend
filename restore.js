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
      
      // Проверяем, что ссылка действительно содержит кривой домен unsplash.com
      if (currentUrl.includes('unsplash.com')) {
        
        // 1. Сначала отсекаем всё, что идет после знака вопроса (параметры)
        const urlWithoutParams = currentUrl.split('?')[0]; 
        // Результат: "https://unsplash.com1546069901-ba9599a7e63c"

        // 2. Вырезаем из этой строки кривое начало "https://unsplash.com"
        const pureId = urlWithoutParams.replace('https://unsplash.com', ''); 
        // Результат: "1546069901-ba9599a7e63c"

        if (pureId && pureId.length > 5) {
          // 3. Собираем ссылку в эталонном формате Unsplash через обычные плюсы
          const correctUrl = 'https://unsplash.com/' + pureId + '?auto=format&fit=crop&w=1200&q=80';

          // Обновляем документ в базе данных
          await collection.updateOne(
            { _id: recipe._id },
            { $set: { imgSource: correctUrl } }
          );

          console.log('✅ Ссылка успешно пересобрана для: ' + recipe.title);
          restoredCount++;
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
