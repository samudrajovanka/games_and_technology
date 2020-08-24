const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('client-sessions');

// ENDPOINT 
const endpoint = "./routes/api";

// Import api
const home = require(`${endpoint}/home`);
const items = require(`${endpoint}/items`);
const accounts = require(`${endpoint}/accounts`);

// Session Middleware 
app.use(session({
    cookieName: "sessioncookie",
    secret: "long_string_which is_hard_to_crack",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}));

// Bodyparser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB CONFIG
const connectDB = require('./config/db');
connectDB();

// HOME
app.use('/', home);

// Items 
app.use('/api/items', items);

// Accounts
app.use('/api/accounts', accounts);
app.use('/accountphoto', express.static('accountphoto'));

// PORT CONNECTION 
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
