const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const Book = require("./../models/bookModel");
const User = require("./../models/userModel");

exports.aliasPopularBooks = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsQuantity, -ratingsAverage";
  next();
};

exports.getAllBooks = catchAsync(async (req, res, next) => {
  //filtering
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Book.find(JSON.parse(queryStr));

  //Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-addedAt");
  }

  //Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 50;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numBooks = await Book.countDocuments();
    if (skip > numBooks) {
      return next(new AppError("This Page does not exist"));
    }
  }

  const books = await query;
  if (books.length === 0) {
    return next(new AppError("There are no books with that criteria....", 400));
  }

  res.status(200).json({
    message: "success",
    results: books.length,
    data: {
      books,
    },
  });
});

exports.createBook = catchAsync(async (req, res, next) => {
  const bookFound = await Book.findOne({ isbn: req.body.isbn });

  if (bookFound) {
    return next(new AppError("The book is already in the database", 404));
  }

  const createdBook = {
    isbn: req.body.isbn,
    title: req.body.title,
    summary: req.body.summary,
    pages: req.body.pages,
    publisher: req.body.publisher,
    published: req.body.published,
    genre: req.body.genre,
    author: req.body.author,
    published: req.body.published,
    cover: req.file.path,
  };
  const newBook = await Book.create(createdBook);

  res.status(201).json({
    message: "success",
    data: {
      newBook,
    },
  });
});

exports.getBook = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.bookid).populate("reviews");

  if (!book) {
    return next(new AppError("No book found with that ID", 404));
  }

  res.status(200).json({
    message: "success",
    data: {
      book,
    },
  });
});

exports.updateBook = catchAsync(async (req, res, next) => {
  const updatedBook = await Book.findByIdAndUpdate(
    req.params.bookid,
    req.body,
    { runValidators: true, new: true }
  );

  if (!updatedBook) {
    return next(new AppError("No book found with that ID", 404));
  }

  res.status(200).json({
    message: "success",
    data: {
      updatedBook,
    },
  });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
  const deletedBook = await Book.findByIdAndDelete(req.params.bookid);

  if (!deletedBook) {
    return next(new AppError("No book found with that ID", 404));
  }

  res.status(200).json({
    message: "success",
    data: {},
  });
});

//favorites controllers

exports.updateFavorites = catchAsync(async (req, res, next) => {
  let updatedList;
  const user = await User.findById(req.user.id);
  const book = await Book.findById(req.params.bookid);
  let isfavorite;

  // const userFavorites = req.user.favorites.filter(favBook => favBook.id === book.id)

  const index = user.favorites.findIndex((item) => item._id == book.id);

  if (index == -1) {
    user.favorites.push(book);
    isfavorite = true;
  } else {
    user.favorites.splice(index, 1);
    isfavorite = false;
  }

  const updatedUser = await User.findByIdAndUpdate(
    { _id: user.id },
    { favorites: user.favorites }
  ).populate("favorites");



  res.status(200).json({
    message: "success",

    data: {
      updatedUser,
      isfavorite
    },
  });
});
