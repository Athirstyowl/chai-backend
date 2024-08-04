import app from "./app.js";
import connectDB from "./db/index.db.js";
import dotenv from 'dotenv'

dotenv.config({
    path: "./.env"
})

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error occured while connecting", error)
    })

    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log('MongoDB Connection Failed', error)
})