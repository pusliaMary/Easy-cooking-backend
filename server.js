import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config'; // Автоматически загружает переменные из .env

// ИСПРАВЛЕНО: Импортируем роутеры и мидлвары с обязательным указанием расширения .js
import authRoutes from './login/routes.js';
import routes from './recipes/routes.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';

const app = express();

mongoose.set('strictQuery', false);
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
    "https://lazy-cooking.netlify.app",
    "http://localhost:3000",
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
    credentials: true,
};

app.disable('x-powered-by');
app.use(cors(corsOptions));

app.options('/*any', cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRoutes);
app.use('/api/recipes', routes);

import path from 'path';
app.use('/uploads', express.static(path.join(import.meta.dirname, 'uploads')));

app.use(notFound);
app.use(errorHandler);

// server.js (или index.js)

const startServer = async () => {
    try {
        // ДОБАВЛЯЕМ ОБЪЕКТ НАСТРОЕК ДЛЯ ДРАЙВЕРА
        await mongoose.connect(process.env.MONGODB_LINK, {
            serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера (5 секунд)
            family: 4                       // Принудительно использовать IPv4 вместо IPv6
        });
        
        console.log("We are connected to Mongo successfully");
        
        app.listen(PORT, () => {
            console.log(`I'm listening to port ${PORT}`);
        });
    } catch (err) {
        console.error("Database initialization failed:", err);
        process.exit(1);
    }
};

startServer();


