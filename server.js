const express = require('express');
const app = express();
const PORT = process.env.PORT || 3500;
const connectDB = require('./config/connectDB');
const mongoose = require('mongoose');
const userRouter = require('./routes/userRouter')

require('dotenv').config();
connectDB();

app.use(express.json())

app.use('/users', userRouter)

app.all('*', (req, res) => {
    res.status(404);
    res.json({message: '404 Not Found'})
})

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`)
})

