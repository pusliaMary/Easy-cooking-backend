import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import cloudinary from './cloudinary.js';

const unlinkAsync = promisify(fs.unlink);

// Исправлено получение __dirname для среды ES-модулей бэкенда
const TEMP_DIR = path.join(import.meta.dirname, '../temp');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const sanitizeFilename = (name) => {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.\-]/g, '')
        .toLowerCase();
};

const generateFileName = (originalName) => {
    const baseName = sanitizeFilename(path.parse(originalName).name);
    const timestamp = Date.now();
    return `${timestamp}-${baseName}.webp`;
};

/**
 * Извлекает чистый public_id для Cloudinary из полной ссылки
 */
/**
 * Извлекает чистый public_id для Cloudinary из полной ссылки через регулярное выражение
 */
export const getPublicIdFromUrl = (url) => {
    if (!url || !url.includes('res.cloudinary.com')) return null;
    try {
        // Регулярное выражение ищет recipes-uploads/ и забирает ВСЁ до точки расширения файла
        const match = url.match(/(recipes-uploads\/[^.]+)/);
        
        if (match && match[0]) {
            return match[0]; // Гарантированно возвращает чистую СТРОКУ, а не массив!
        }
        
        return null;
    } catch (e) {
        console.error('❌ Ошибка парсинга URL в getPublicIdFromUrl:', e.message);
        return null;
    }
};


/**
 * Оптимизирует входящий файл через Sharp и загружает его в Cloudinary
 */
export const saveFile = async (file) => {
    try {
        const optimizedFileName = generateFileName(file.originalname);
        const tempOutputPath = path.join(TEMP_DIR, optimizedFileName);

        const stats = fs.statSync(file.path);
        const fileSizeMB = stats.size / (1024 * 1024);

        let quality, width;
        if (fileSizeMB > 5) {
            quality = 45;
            width = 1024;
        } else if (fileSizeMB > 3) {
            quality = 50;
            width = 1280;
        } else if (fileSizeMB > 1.5) {
            quality = 55;
            width = 1600;
        } else {
            quality = 75;
            width = 1920;
        }

        await sharp(file.path)
            .resize({ width, withoutEnlargement: true })
            .webp({ quality, effort: 6, lossless: false })
            .toFile(tempOutputPath);

        const result = await cloudinary.uploader.upload(tempOutputPath, {
            folder: 'recipes-uploads',
            public_id: optimizedFileName.replace('.webp', ''),
            resource_type: 'image',
        });

        await unlinkAsync(file.path);
        await unlinkAsync(tempOutputPath);

        return result.secure_url;

    } catch (err) {
        console.error('Ошибка при сохранении изображения:', err);
        throw new Error('Ошибка при обработке изображения');
    }
};

/**
 * Удаляет файл из медиатеки Cloudinary по его public_id
 */
export const deleteFile = async (cloudinaryPublicId) => {
    try {
        if (!cloudinaryPublicId) {
            console.warn('⚠️ [Cloudinary] Передан пустой Public ID для удаления.');
            return;
        }

        console.log(`📡 [Cloudinary] Отправка запроса на удаление файла: "${cloudinaryPublicId}"...`);

        // ИСПРАВЛЕНО: Явно передаем resource_type и форсируем сброс кэша через invalidate
        const result = await cloudinary.uploader.destroy(cloudinaryPublicId, {
            resource_type: 'image',
            invalidate: true 
        });

        // Выводим точный ответ от серверов Cloudinary
        console.log('✉️ [Cloudinary] Ответ сервера:', result);

        if (result.result === 'ok') {
            console.log(`🧹 [Cloudinary] Файл успешно удален: ${cloudinaryPublicId}`);
        } else {
            console.warn(`⚠️ [Cloudinary] Файл не был удален. Причина:`, result.result);
        }
    } catch (err) {
        console.error('💥 Ошибка при удалении файла из Cloudinary:', err.message);
    }
};
