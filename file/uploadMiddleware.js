import multer from 'multer';
import path from 'path';
import fs from 'fs';

const TEMP_DIR = path.join(import.meta.dirname, '../temp');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const createStorage = () => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, TEMP_DIR);
        },
        filename: (req, file, cb) => {
            const cleanName = file.originalname.normalize('NFC').replace(/\s+/g, '-');
            const uniqueName = `${Date.now()}-${cleanName}`;
            cb(null, uniqueName);
        }
    });

    return multer({
        storage,
        fileFilter: (req, file, cb) => {
            const allowedMimeTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/heic',
                'image/heif',
                'image/webp'
            ];

            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Неверный тип файла.'));
            }
        }
    });
};

export default createStorage;
