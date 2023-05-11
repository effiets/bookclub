const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    require: [true, "a User must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "You must enter a correct email..."],
  },

  password: {
    type: String,
    required: [true, "you must enter a password"],
    minlength: [8, "it must be at least 8 digits"],
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, "please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  name: {
    type: String,
    require: [true, "a Uuer must have an name"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  avatar: {
    type: String,
    required: true,
 
  },

  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],

  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //active for 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
