const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("account");
const keys = require("../config/keys");

const option = {};
option.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
option.secretOrKey = keys.secretOrKey;

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(option, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .populate("roleId")
        .then((user) => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch((err) => console.log(err));
    })
  );
};
