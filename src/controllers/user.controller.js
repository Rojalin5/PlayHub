import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
  //1.get user details from frontend
  //2.validation - no empty (any field)
  //3.check if user already exist:username,email etc.
  //4.check for images,check for avatar
  //5.upload them to cloudinary
  //6.create user object - create entry in db.
  //7.remove password and refresh token field from response
  //8.check for user creation
  //9.return response if error then return err

  //1
  const { fullName, username, email, password } = req.body;
  console.log("email:", email)

  //2
  if (fullName === "") {
    throw new ApiError(400, "fullname is required")
  }
  if (username === "") {
    throw new ApiError(400, "username is required")
  }
  if (email === "") {
    throw new ApiError(400, "email is required")
  }
  if (password === "") {
    throw new ApiError(400, "password is required")
  }

  //advanced method : using some method
  // if([fullName,username,email,password].some((fields)=>
  // fields?.trim()===""))
  // {
  //   throw new ApiError(400,"all fields are required")
  // }

  //3
  const existedUser = User.findOne({ $or: [{ username }, { email }] })
  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists")
  }
  //4  
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLoaclPath = req.files?.coverImage[0]?.path;
  if(!avatarLocalPath){
  throw new ApiError(404, "Avatar file is required")
  }
  //5
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLoaclPath)
  if (avatar) {
  throw new ApiError(404,"Avatar file is required")
}
const user = await User.create({
  fullName,
  avatar:avatar.url,
  coverImage: coverImage?.url || "",
  email,
  password,
  username,
})
const createdUser = await User.findById(user._id).select(
  "-password -refreshToken")
if(!createdUser){
  throw new ApiError(500,"Something went wrong while registering the user")
}
  return res.status(201).json(
    new ApiResponse(200,createdUser,"user Registered Successfully",)
  )

})
export { registerUser }