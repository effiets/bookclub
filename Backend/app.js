const express = require("express");
const cors = require("cors");
const path = require("path");
const bookRouter = require("./routes/bookRoutes");
const userRouter = require("./routes/userRoutes");
const reviewsRouter = require("./routes/reviewsRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
// const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());
// app.use(cookieParser());

app.use(`/uploads/images`, express.static(path.join("uploads", "images")));
app.use(`/uploads/covers`, express.static(path.join("uploads", "covers")));

app.use("/api/v1/books", bookRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewsRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});

app.use(globalErrorHandler);

module.exports = app;
