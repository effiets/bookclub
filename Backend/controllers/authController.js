const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//use cookie instead of localstorage
// const options = {
//   expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
//   secure: false,
//   httpOnly: true,
// };

exports.signUp = catchAsync(async (req, res, next) => {
  const createdUser = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    avatar: req.file.path,
  };
  const newUser = await User.create(createdUser);


  const token = signToken(newUser._id);

  //use cookie instead of localstorage
  // res.cookie("jwt", token, options)

  res.status(201).json({
    status: "success",
    token,
    userid: newUser._id,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const token = signToken(user.id);

  //use cookie instead of localstorage

  // res.cookie("jwt", token, options)

  res.status(200).json({
    status: "success",
    token,
    userid: user.id,
    role: user.role,
  });
});

//only if we use cookies

exports.logout = (req, res) => {
  // res.clearCookie("jwt", {
  //   expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  //   secure: false,
  //   httpOnly: true,
  //   domain: "localhost",
  //   path: "/",
  // });
  // res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError("The token does no longer exist", 401));
  }

  req.user = freshUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have persmission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // const resetURL = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/users/resetPassword/${resetToken}`;
  const resetURL = `http://localhost:3001/resetPassword/${resetToken}`;

  const message = `Forgot your Password?? Reguest a new one... to ${resetURL} \n If you didn't forget your password, please ignore this email...`;

  try {
    await sendEmail({
      email: user.email,
      subject: " Your password reset token (valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "token sent to email",
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined);
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const token = signToken(user.id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  const token = signToken(user.id);
  res.status(200).json({
    status: "success",
    token,
    userid: user.id,
  });
});
