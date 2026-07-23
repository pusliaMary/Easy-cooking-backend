const express = require('express')
const app = express()

const mongoose = require('mongoose')
const routes = require('./Routes')
const cors = require('cors')
require('dotenv').config()
mongoose.set('strictQuery', false)
const PORT = process.env.PORT || 8000

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

