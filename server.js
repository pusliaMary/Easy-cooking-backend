const express = require('express')
const app = express()
const PORT = 8000 || process.env.PORT

const mongoose = require('mongoose')
require('dotenv').config()
mongoose.set('strictQuery', false)

mongoose
    .connect(process.env.MONGODB_LINK)
    .then(()=> console.log("We are connected to Mongo"))
    .catch(err => console.log(err)) 

app.listen(PORT, ()=> {
    console.log(`I'm listening to port ${PORT}`)
})
