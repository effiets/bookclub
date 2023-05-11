const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    isbn: {
      type: String,
      required: [true, "a book must have a ISBN"],
      minLength: [10, "a isbn must have at least 10 digits"],
    },
    title: {
      type: String,
      required: [true, "a book must have a title"],
    },
    summary: String,
    pages: Number,
    publisher: String,
    published: Date,
    addedAt: {
      type: Date,
      default: Date.now,
    },
    cover: {
      type: String
    },

    genre: {
      type: String,
      enum: [
        "Crime",
        "History",
        "Finction",
        "Biography",
        "Sci-Fi/Fantasy",
        "Romance",
        "Comic/Graphic Novel",
        "Travel / Lifestyle",
        "Classic",
        "Philosophy"
      ],
      required: [true, "you must choose a genre"],
    },

    author: String,
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//virtual populate
bookSchema.virtual("reviews", {
  ref: "Reviews",
  foreignField: "book",
  localField: "_id",
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
