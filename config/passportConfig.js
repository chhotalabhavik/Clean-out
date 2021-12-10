const mongoose = require("mongoose");
const UserModel = require("../models/User");
const Response = require("../models/Response");
const RESPONSE = require("../models/Enums/RESPONSE");
const bcrypt = require("bcryptjs");

const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.SESSION_SECRET,
	algorithm: ["RS256"],
};

const strategy = new JwtStrategy(options, async (payload, done) => {
	try {
		const user = await UserModel.findById(payload._id);
		if (user) return done(null, user);
		else return done(null, false);
	} catch (error) {
		done(error, false);
	}
});

module.exports = async (passport) => {
	passport.use(strategy);
};
