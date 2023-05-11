const express = require("express");
const reviewsController = require("./../controllers/reviewsController");
const authController = require("./../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewsController.getAllReviews)
  .post(authController.protect, reviewsController.createReview)

  router.route("/:reviewid")
  .patch(authController.protect, reviewsController.updatereview)
  .delete(authController.protect, reviewsController.deleteReview);

module.exports = router;
