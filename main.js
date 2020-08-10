const express = require ('express');
const bodyParser = require('body-parser');
const app = express();

// Bodyparser Middleware
app.use(bodyParser.json());

// DB CONFIG
const connectDB = require ('./config/db');
    connectDB();

// ENDPOINT 
const endpoint = "./routes/api"

// HOME
const home = require (`${endpoint}/home`);
    app.use('/', home);

// Items 
const items = require (`${endpoint}/items`);
    app.use('/api/items', items);

// Accounts
const accounts = require (`${endpoint}/accounts`);
    app.use('/api/accounts', accounts);

// PORT CONNECTION 
const port = process.env.PORT || 3000;
    app.listen(port,() => console.log(`Server started on port ${port}`));
