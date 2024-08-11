import {v2 as cloudinary} from "cloudinary"
import fs from 'fs' // fs is filesystem which is a package in node.js allowing us to work with files (read, write, remove, permission)

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" //upload options
        })
        // file hs been uploaded successfully
        console.log('File has been uploaded on cloudinary', response)
        fs.unlinkSync(localFilePath)
        return response
    }
    catch(error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload got failed
    }
}


export {uploadOnCloudinary}