const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const passport = require('passport');
const content = require('./models/content');
require('dotenv').config();

// Endpoint
const endpoint = './routes/api';

// Import api
const home = require(`${endpoint}/home`);
const admin = require(`${endpoint}/admin`);
const accounts = require(`${endpoint}/accounts`);
const roles = require(`${endpoint}/roles`);
const content = require(`${endpoint}/contents`);
// import uri for mongodb
const db = require('./config/keys').uri;

// Bodyparser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Passport middleware
app.use(passport.initialize());

// Passport CONFIG
require('./config/passport')(passport);

// Connect TO MongoDB
mongoose
  .connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Database Connected...!'))
  .catch((err) => console.perlog(err));

// routes
app.use('/', home);
app.use('/api/accounts', accounts);
app.use('/api/admin', admin);
app.use('/api/admin/roles', roles);
app.use('/api/admin/contents', content);
app.use('/static', express.static('static'));
// PORT CONNECTION
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
