import mongoose, { Schema } from "mongoose"
import bcrypt from 'bcrypt' // hash your password
import jwt from 'jsonwebtoken'  // encode your payload data

const userSchema = new Schema({
    username: {
        required: true,
        type: String,
        unique: true,
        lowercase: true,
        trim: true, // removes whitespace at the start and end of the word
        index: true
    },
    email: {
        required: true,
        type: String,
        unique: true,
        lowercase: true,
        trim: true, // removes whitespace at the start and end of the word
    },
    fullname: {
        required: true,
        type: String,
        trim: true, // removes whitespace at the start and end of the word
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is inncorect']
    },
    refreshToken: {
        type: String,
    }



}, { timestamps: true })


//pre hook is a middleware used to perform smtg before storing the data in the db
// dont use () => {} bcuz we dont have access to this keyword
userSchema.pre("save", async function(next) {
    if(!this.isModified('password')) return next();

    this.password = bcrypt.hash(this.password, 10)
    next()

})

//userSchema has an object "methods", which allows you to add custom quering methods, here "isPasswordCorrect" & ''
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id, //key are coming from payload the value is coming from db
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id, //key are coming from payload the value is coming from db
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", userSchema)

export default User