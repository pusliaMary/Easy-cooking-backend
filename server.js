const express = require('express')
const app = express()

const mongoose = require('mongoose')
const routes = require('./Routes')
const cors = require('cors')
require('dotenv').config()
mongoose.set('strictQuery', false)
const PORT = process.env.PORT || 8000

const allowedOrigins = [
    "https://easy-cooking-backend.onrender.com",
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

mongoose
    .connect(process.env.MONGODB_LINK)
    .then(()=> console.log("We are connected to Mongo"))
    .catch(err => console.log(err)) 

app.use(routes)

app.listen(PORT, ()=> {
    console.log(`I'm listening to port ${PORT}`)
})

