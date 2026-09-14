const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const cloudinary = require('./cloudinary');

const unlinkAsync = promisify(fs.unlink);
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


module.exports.getPublicIdFromUrl = (url) => {
    if (!url || !url.includes('://cloudinary.com')) return null;
    const parts = url.split('/');
    const folderAndFile = parts.slice(parts.indexOf('recipes-uploads')).join('/'); // Подставьте имя вашей папки в Cloudinary
    return folderAndFile.split('.')[0]; // Отрезаем .webp расширение
};


module.exports.saveFile = async (file) => {
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

module.exports.deleteFile = async (cloudinaryPublicId) => {
    try {
        await cloudinary.uploader.destroy(cloudinaryPublicId);
    } catch (err) {
        console.error('Ошибка при удалении файла из Cloudinary:', err);
    }
};
