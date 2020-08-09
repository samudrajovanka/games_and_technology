const express = require ('express');
const bodyParser = require('body-parser');
const app = express();

// Bodyparser Middleware
app.use(bodyParser.json());

// DB CONFIG
const connectDB = require ('./config/db');
    connectDB();

// Items 
const items = require ('./routes/api/items');
app.use('/api/items', items);

// Accounts
const accounts = require ('./routes/api/accounts');
app.use('/api/accounts', accounts);

// PORT CONNECTION 
const port = process.env.PORT || 3000;
    app.listen(port,() => console.log(`Server started on port ${port}`));
