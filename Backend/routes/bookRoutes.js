const express = require("express");
const bookController = require("./../controllers/bookController");
const authController = require("./../controllers/authController");
const reviewsRouter = require("./../routes/reviewsRoutes");
const coverUpload = require("../middleware/cover-upload");

const router = express.Router();

router.use("/:bookid/reviews", reviewsRouter);

router
  .route("/5-popular-books")
  .get(bookController.aliasPopularBooks, bookController.getAllBooks);



router
  .route("/")
  .get(bookController.getAllBooks)
  .post(coverUpload.single("cover"), bookController.createBook);
router
  .route("/:bookid")
  .get(bookController.getBook)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    bookController.updateBook
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    bookController.deleteBook
  );

router
  .route("/:bookid/favorites")
  .patch(
    authController.protect,
    authController.restrictTo("user"),
    bookController.updateFavorites
  );

module.exports = router;
