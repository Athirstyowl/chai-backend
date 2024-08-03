import mongoose from "mongoose"
import DB_NAME from '../constants.js'


async function connectDB () {
    try{
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       //console.log('connectionInstance :: ', connectionInstance)
       console.log('Mongodb connected to :: ', connectionInstance.connection.host)
    }
    catch (error){
        console.log("MongoDB Connection Failed", error)
        process.exit(1)
    }
}

export default connectDB