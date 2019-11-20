const passport = require("passport");
const passportJWT = require("passport-jwt");
const User = require("./models/user");
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = passportJWT.Strategy;

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    async function(email, password, cb) {
      //Assume there is a DB module pproviding a global UserModel
      try {
        const loggedUser = await User.findOne({ email, password });

        if (!loggedUser) {
          return cb(null, false, { message: "Email ou senha incorretos." });
        } else {
          return cb(null, loggedUser, {
            message: "Logged In Successfully"
          });
        }
      } catch (err) {
        console.log({ err });
      }
      // .then(user => {
      //   if (!user) {
      // return cb(null, false, { message: "Email ou senha incorretos." });
      //   }

      // return cb(null, user, {
      //   message: "Logged In Successfully"
      // });
      // })
      // .catch(err => {
      //   return cb(err);
      // });

      //return loggedUser;
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "secret"
    },
    function(jwtPayload, cb) {
      //find the user in db if needed
      return User.findById(jwtPayload._id)
        .then(user => {
          return cb(null, user);
        })
        .catch(err => {
          return cb(err);
        });
    }
  )
);
