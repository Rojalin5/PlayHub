import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
// Upload an image
const uploadOnCloudinary = async (localFilepath) => {
    try {
        if (!localFilepath) return null;
        const response = await cloudinary.uploader.upload(localFilepath, {
            resource_type: "auto"
        })
        //file has been uploaded
        // console.log("File has been uploaded on cloudinary", response.url)
        fs.unlinkSync(localFilepath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilepath)//remove the file locally saved temporary file as the file operation failed
        return null;
    }
}

export { uploadOnCloudinary }



