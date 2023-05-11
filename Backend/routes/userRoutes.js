const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.post("/signup", fileUpload.single('image'),  authController.signUp);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.patch("/updateMe", authController.protect, userController.updateMe);

router.delete("/deleteMe", authController.protect, userController.deleteMe);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  )
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    userController.createUser
  );

router
  .route("/:userid")
  .get(userController.getUser)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    userController.deleteUser
  );


    
router
.route("/:userid/myfavorites")
.get(
  authController.protect,
  authController.restrictTo("user"),
  userController.getMyFavorites
);
module.exports = router;
