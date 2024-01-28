import { asyncHandler } from "../utils/aysncHandler";
import { ApiError } from "../utils/apiError.js";
import { jwt } from "jsonwebtoken";
import { User } from "../model/user.models.js";
export const verifyJWT = asyncHandler(async (req, res, next) => {
 try{ const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");
  if (!token) {
    throw new ApiError(400, "no user found");
  }
  const decoded_token = await jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET
  );
  const user = User.findById(decoded_token?._id).select(
    "-password,refreshToken"
  );
  if (!user) {
    throw new ApiError(401, "Invalid access token");
  }
  req.user=user
  next()
}
catch(error){
    throw new ApiError(401,"Invalid access token value in catch")
}
});
