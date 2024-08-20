import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        //save refreshToken in db
        user.refreshToken = refreshToken
        await save({ validateBeforeSave: false })
        
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Tokens")
    }
}
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
    const { fullname, email, username, password } = req.body
    console.log('Email:', email);
    console.log(req)
    if (
        [fullname, email, username, password].some((field) =>
          field?.trim() === '' )
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //search for a user using Model
    const existedUser = await User.findOne({
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
        fullname,
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

// things to do in login
//1) get email username password from req
//2) is it username or email
//3) find the user
//4) password check
//5) generate accesstoken and refresshToken
//6) send them and keep them in cookies
const loginUser = asyncHandler( async(req, res) => {
    const {email, username, password} = req.body
    if (!(username || email)) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{email}, {username}],
    })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    //Now the earlier user object in this function does not have the refresh.
    // So we need to either update it or make a new user object
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //sending cookies
    const options ={
        httpOnly: true, // cannot modift from frontend
        secure: true  
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler( async(req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json( new ApiResponse(200, {}, "User logged Out"))
})

// this below method will be used when AccessToken expires and a new accessToken is required for the user
// It takes the users refresh Token, compare it with the refresh token of user in the db and it matched provide a new access token
// It allows the Frontend to it an api for 401, and auto login before asking the user to Login again
const refreshAccessToken = asyncHandler( async(req, res) =>{
    try {
        const incomingRefreshToken = await req.cookies.refreshToken || req.body.refreshToken
    
        if(!incomingRefreshToken) throw new ApiError(401, "Unauthorized request")
        
            //does not alway have a payload
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedRefreshToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "RefeshToken is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, newrefreshToken},
                "Access Token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh token")   
    }
})

export {registerUser, loginUser, logoutUser, refreshAccessToken}