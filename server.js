const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const passport = require("passport");
const session = require("client-sessions");

// ENDPOINT
const endpoint = "./routes/api";

// Import api
const home = require(`${endpoint}/home`);
const admin = require(`${endpoint}/admin`);
const accounts = require(`${endpoint}/accounts`);
const roles = require(`${endpoint}/roles`);

// Session Middleware
//  app.use(
//   session({
//     cookieName: "sessioncookie",
//     secret: "long_string_which is_hard_to_crack",
//     duration: 30 * 60 * 1000,
//     activeDuration: 5 * 60 * 1000,
//   })
//  );

// Bodyparser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB CONFIG
const db = require("./config/keys").uri;

// CONNECT TO MongoDB
mongoose
  .connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Database Connected...!"))
  .catch((err) => console.log(err));

// HOME
app.use("/", home);

// Items
app.use("/api/admin", admin);

// Accounts
app.use("/api/accounts", accounts);
app.use("/account-photo", express.static("accountPhoto"));

// PASSPORT middleware
app.use(passport.initialize());

// PASSPORT CONFIG
require("./config/passport")(passport);

// PORT CONNECTION
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
