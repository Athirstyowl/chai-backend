import connectDB from "./db/index.db.js";
import dotenv from 'dotenv'

dotenv.config({
    path: "./.env"
})

connectDB()