const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
mongoose.set('strictQuery', false)
const PORT = process.env.PORT || 8000

const authRoutes = require('./login/routes');
const routes = require('./recipes/routes');
const { notFound, errorHandler } = require('./auth/error.middleware')

const allowedOrigins = [
    "https://easy-cooking-back.onrender.com",
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



app.use(cors(corsOptions));
app.options("/*any", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(cookieParser());

mongoose
    .connect(process.env.MONGODB_LINK)
    .then(()=> console.log("We are connected to Mongo"))
    .catch(err => console.log(err)) 

app.use('/api', authRoutes);
app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, ()=> {
    console.log(`I'm listening to port ${PORT}`)
})

