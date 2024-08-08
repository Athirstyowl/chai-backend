import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// thing to do in register
/*
1)get user details from frontend
2)validate, make sure fields are not empty
3)check if user already exists (username and email)
4)check for images, check for avatar
5)upload them to cloudinary, avatar
6)create user object, create entry in database,
7)remove password and refresh token field from response
8)check for user creation
9)return res
*/
const registerUser = asyncHandler( async(req, res) => {
    const { fullName, email, username, password } = req.body
    console.log('Email:', email);
    console.log(req)
    if (
        [fullName, email, username, password].some((field) =>
          field?.trim() === '' )
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //search for a user using Model
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "Email or Username already used")
    }

    console.log("This is Request object", req)
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required")
    //if (!coverImageLocalPath) throw new ApiError(400, "Cover Image file is required")
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) throw new ApiError(400, "Avatar file is required")
    //if (!coverImage) throw new ApiError(400, "Cover Image file is required")

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '', //Since coverImage is not compulor we need to check as pass the url only if it exist
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) throw new ApiError(500, "Failed to Register User")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export {registerUser}