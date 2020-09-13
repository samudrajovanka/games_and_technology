const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const passport = require('passport');
require('dotenv').config();

// Endpoint
const endpoint = './routes/api';

// Import api
const admin = require(`${endpoint}/admin`);
const accounts = require(`${endpoint}/accounts`);
const roles = require(`${endpoint}/roles`);
const contents = require(`${endpoint}/contents`);

// import uri for mongodb
const db = require('./config/keys').uri;

// Bodyparser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Passport middleware
app.use(passport.initialize());

// Passport config
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
  .catch((err) => console.log(err));

// routes
app.use('/api/accounts', accounts);
app.use('/api/admin', admin);
app.use('/api/admin/roles', roles);
app.use('/api/admin/contents', contents);
app.use('/static', express.static('static'));

// middleware for hanlder page not found
const notFound = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Page not found',
  });
};
app.use(notFound);

// PORT CONNECTION
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
