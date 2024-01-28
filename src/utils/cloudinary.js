import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = cloudinary.uploader.upload(
        localFilePath ,
      { public_id: "olympic_flag" },
    )
    console.log("file uploaded successfully",response.url)
    return response 
} catch (error) {
         fs.unlink(localFilePath)
         console.log(localFilePath)
  }
};

export {uploadOnCloudinary}