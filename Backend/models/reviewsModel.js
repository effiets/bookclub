const mongoose = require("mongoose");
const { Schema } = mongoose;
const Book = require("./bookModel");

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      require: [true, "Review can no be empty!!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    book: {
      type: mongoose.Schema.ObjectId,
      ref: "Book",
      required: [true, "Review must belong to a book"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong tp a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name avatar",
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (bookid) {
  const stats = await this.aggregate([
    {
      $match: { book: bookid },
    },
    {
      $group: {
        _id: "$book",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookid, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Book.findByIdAndUpdate(bookid, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.index({ book: 1, user: 1 }, { unique: true });

reviewSchema.post("save", function (next) {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Reviews = mongoose.model("Reviews", reviewSchema);
module.exports = Reviews;
