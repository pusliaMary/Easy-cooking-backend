const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

mongoose.set('strictQuery', false);
const PORT = process.env.PORT || 8000;

const authRoutes = require('./login/routes');
const routes = require('./recipes/routes');
const { notFound, errorHandler } = require('./auth/error.middleware');

const allowedOrigins = [
    "https://easy-cooking-back.onrender.com",
    "https://lazy-cooking.netlify.app",
    "http://localhost:3000",
    "http://localhost:8000"
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
app.options('*any', cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRoutes);
app.use('/api/recipes', routes);

app.use('/uploads', express.static('uploads'));

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_LINK);
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
