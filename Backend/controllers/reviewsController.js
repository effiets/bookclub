const catchAsync = require("../utils/catchAsync");
const Review = require("./../models/reviewsModel");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.bookid) filter = { book: req.params.bookid };
  const reviews = await Review.find(filter);

  res.status(200).json({
    status: "success",
    result: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.book) req.body.book = req.params.bookid;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    }
  });
});

exports.updatereview = catchAsync(async (req, res, next) => {
  if (!req.body.book) req.body.book = req.params.bookid;
  if (!req.body.user) req.body.user = req.user.id;

  const updatedReview = await Review.updateOne(
    { _id: req.params.reviewid },
    req.body,
    { runValidators: true, new: true }
  );

  if (!updatedReview) {
    return next(new AppError("No review found with that ID", 404));
  }

  res.status(200).json({
    message: "success",
    data: {
      updatedReview,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const deletedReview = await Review.deleteOne({ _id: req.params.reviewid });

  if (!deletedReview) {
    return next(new AppError("No review found with that ID", 404));
  }

  res.status(200).json({
    message: "success",
  });
});
