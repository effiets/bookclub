const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");

const filterObj = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObject[el] = obj[el];
  });
  return newObject;
};

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userid).populate('favorites')

  if (!user) {
    return next(new AppError("This user does not exist", 401));
  }

  res.status(200).json({
    message: "success",
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "this route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, "name", "email");

  const updateduser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    runValidators: true,
    new: true,
  });

  res.status(202).json({
    status: "success",
    data: {
      updateduser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const deleteUser = await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    status: "success",
  });
});

//only for Admin

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    message: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    message: "success",
    data: {
      newUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "success",
  });
});

exports.getMyFavorites = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("favorites");

  if (user.favorites.length == 0) {
    return next(new AppError("There are no books in your favorites list"), 404);
  }


  res.status(200).json({
    message: "success",
    results: user.favorites.length,
    data: {
      data: user.favorites,
    },
  });
});
