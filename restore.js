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
    console.log(`🔍 Всего рецептов в базе: ${recipes.length}`);

    let restoredCount = 0;

    for (const recipe of recipes) {
      const currentUrl = recipe.imgSource || '';
      const title = recipe.title || 'food';

      // Ищем валидный ID Unsplash в строке, если он там есть
      const match = currentUrl.match(/(photo-[a-zA-Z0-9-]+|premium_photo-[a-zA-Z0-9-]+)/);
      
      let finalUrl = '';

      if (match && match[0] && !currentUrl.includes('{unsplashId}')) {
        // Вариант 1: Жесткая склейка оригинального ID со слэшем и правильным поддоменом images.
        finalUrl = 'https://unsplash.com' + match[0] + '?auto=format&fit=crop&w=1200&q=80';
      } else {
        // Вариант 2: Жесткая склейка поискового URL со слэшем
        const searchQuery = encodeURIComponent(title.toLowerCase());
        const randomSig = Math.floor(Math.random() * 100000);
        
        finalUrl = 'https://unsplash.comphoto-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80&sig=' + randomSig + '&q_search=' + searchQuery;
      }

      // Обновляем документ в MongoDB
      await collection.updateOne(
        { _id: recipe._id },
        { $set: { imgSource: finalUrl } }
      );
      
      console.log(`✅ Исправлен URL для: "${title}" -> ${finalUrl}`);
      restoredCount++;
    }

    console.log(`\n🎉 Скрипт успешно завершил работу! Проверьте фронтенд.`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await CLIENT.close();
  }
}

run();
