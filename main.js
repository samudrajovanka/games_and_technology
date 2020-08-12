const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('client-sessions');

// Session Middleware 
app.use(session({
    cookieName: "sessioncookie",
    secret: "long_string_which is_hard_to_crack",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}));

// Bodyparser Middleware
app.use(bodyParser.json());

// DB CONFIG
const connectDB = require('./config/db');
connectDB();

// PORT CONNECTION 
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));

// ENDPOINT 
const endpoint = "./routes/api"

// HOME
const home = require(`${endpoint}/home`);
app.use('/', home);

// Items 
const items = require(`${endpoint}/items`);
app.use('/api/items', items);

// Accounts
const accounts = require(`${endpoint}/accounts`);
app.use('/api/accounts', accounts);
app.use('/accountohoto', express.static('accountphoto'));

// PORT CONNECTION 
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
