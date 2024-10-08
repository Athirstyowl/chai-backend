import User from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

// when u login, you give access token refresh token. 
// So we need to verify that token to login
export const verifyJWT = asyncHandler( async(req, _, next) => {
   try {
     const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", '')
 
     if (!token){
         throw new ApiError(401, "Unauthorized request")
     }
     console.log("Token: ", token)
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
     console.log("Decoded Token: ", decodedToken)
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if (!user) {
         throw new ApiError(401, "Invalid Accesss Token")
     }
     // adding a new object in the request object
     req.user = user;
     next()
   } catch (error) {
    throw new ApiError(401, "Invalid Access Token")
   }
})