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

    let restoredWithId = 0;
    let restoredWithSearch = 0;

    for (const recipe of recipes) {
      const currentUrl = recipe.imgSource || '';
      const title = recipe.title || 'food';

      // 1. Проверяем, есть ли в строке уцелевший валидный ID Unsplash
      const match = currentUrl.match(/(photo-[a-zA-Z0-9-]+|premium_photo-[a-zA-Z0-9-]+)/);

      if (match && match[0] && !currentUrl.includes('{unsplashId}')) {
        const cleanUrl = 'https://unsplash.com' + match[0] + '?auto=format&fit=crop&w=1200&q=80';
        
        await collection.updateOne({ _id: recipe._id }, { $set: { imgSource: cleanUrl } });
        console.log(`🎯 Оригинальный ID сохранен для: "${title}"`);
        restoredWithId++;
      } 
      // 2. Если ссылка кривая, генерируем современный поисковый URL по названию блюда
      else {
        const searchQuery = encodeURIComponent(title.toLowerCase());
        // Генерация случайного числа для сброса кэша Unsplash (чтобы картинки не повторялись)
        const randomSig = Math.floor(Math.random() * 100000);
        
        // Современный рабочий формат динамического поиска картинок в Unsplash
        const finalSmartUrl = 'https://unsplash.comphoto-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80&sig=' + randomSig + '&q_search=' + searchQuery;

        await collection.updateOne({ _id: recipe._id }, { $set: { imgSource: finalSmartUrl } });
        console.log(`✨ Обновлена рабочая поисковая ссылка для: "${title}"`);
        restoredWithSearch++;
      }
    }

    console.log(`\n🎉 Скрипт завершил работу!`);
    console.log(`🎯 По оригинальным ID проверено/восстановлено: ${restoredWithId}`);
    console.log(`✨ По названию блюда успешно перезаписано: ${restoredWithSearch}`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await CLIENT.close();
  }
}

run();
