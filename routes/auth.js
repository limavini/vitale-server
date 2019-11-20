const express = require("express");
const router = express.Router();
require("passport");
const jwt = require("jsonwebtoken");
const passport = require("passport");

router.post("/", (req, res) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (user) res.status(200).json({ user });
    else res.sendStatus(403);
  })(req, res);
});

/* POST login. */
router.post("/login", function(req, res) {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      console.log({err, user});
      return res.status(400).json({
        message: info ? info.message : "Login failed",
        user: user
      });
    }

    req.login(user, { session: false }, err => {
      if (err) {
        res.send(err);
      }

      const token = jwt.sign(user.toJSON(), "secret");

      return res.json({ user, token });
    });
  })(req, res);
});

module.exports = router;
