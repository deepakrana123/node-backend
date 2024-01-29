import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controller/user.controller";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 3,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser)
// secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/changeCurrentPassword").post(verifyJWT,changeCurrentPassword)
router.route("/getSingleUserDeatils").get(verifyJWT,getCurrentUser)

