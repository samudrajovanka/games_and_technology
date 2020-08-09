const express = require ('express');
const bodyParser = require('body-parser');
const app = express();

// Bodyparser Middleware
app.use(bodyParser.json());

// DB CONFIG
const connectDB = require ('./config/db');
    connectDB();

// PORT CONNECTION 
const port = process.env.PORT || 3000;
    app.listen(port,() => console.log(`Server started on port ${port}`));
