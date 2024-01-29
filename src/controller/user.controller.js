import { asyncHandler } from "../utils/aysncHandler";
import { User } from "../model/user.models";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError.js";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const generateAccessToken = user.generateAccessToken();
    const generateRefreshToken = user.generateRefreshToken();
    user.refreshToken = generateRefreshToken;
    await user.save({ validateBeforeSave: false });
    return { generateAccessToken, generateRefreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "SOmething went wrong while genrating refresh and accessToken"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  /*
step-1:take user name , email,password or get user deatils form frontend
step-2:validation-not empty
step-3:take image of user or cover image
step-4:check if user already exist
step-5:upload image to cloduinary
step-6:delete form local server
step-7:create user object - create entry in db
step-8 remove password and refresh token field form response
step-9:check for user creation
step-10 return
*/

  const { fullName, email, username, password } = req.body;
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "These user already exist");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is needed");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.create({
    username: username,
    email: email,
    password: password,
    fullName: fullName,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
    refreshToken: "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password",
    "-refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went please try again");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Created", "SuccessFully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get user email,password
  // validate email and password, but first get decrypted password
  // find the user
  // password check
  // accesstoken and refreshtoken
  // send cookie
  // res
  const { username, email, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "username or email any one is required");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "no user found or user doesnot exit");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(404, "Password is incorrect");
  }
  const { generateAccessToken, generateRefreshToken } =
    await generateAccessandRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password ");
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", generateAccessToken, options)
    .cookie("refreshToken", generateRefreshToken, options)
    .josn(
      new ApiResponse(200, loggedInUser, "Successfully logged In", "sucess")
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized token");
    }
    const refreshAccess = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(refreshAccess?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh is invalid or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { generateAccessToken, generateRefreshToken } =
      await generateAccessandRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", generateAccessToken, options)
      .cookie("refreshToken", generateRefreshToken, options)
      .josn(new ApiResponse(200, user, "Successfully logged In", "sucess"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});


const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,updatedPassword}=req.body
  const user =await User.findById(req.user._id)
  const isPasswordCorrect=await user .isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid old password")
  }
  user.password=updatedPassword
  await user.save({validateBeforeSave:false})
  return res.status(200).json(new ApiResponse(200,"","Password Changed Succesfully","success"))

})

const getCurrentUser =asyncHandler(async(req,res)=>{
  return res.status(200).json(new ApiResponse(200,req.user,"User detail","success"))
})
export { registerUser, loginUser, logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser };
