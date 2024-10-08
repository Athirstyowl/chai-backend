import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit:"16kb"})) //limit to the size of json request it can receive
app.use(express.urlencoded({extended: true, limit: "16kb"})) // parses incoming requests with URL-encoded payloads and is based on the body-parser module.
app.use(express.static("public")) //storing pictures pdf in public dirctory
app.use(cookieParser()) //access and doing crud operations on the user's browser cookies

// routes
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter) //whenever you u will have /api/v1/users url you will be passed to userRouter

export default app