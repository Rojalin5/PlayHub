import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = await user.generateAccessToken()
    const refreshToken =  await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token")
  }
}

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
  const existedUser = await User.findOne({ $or: [{ username }, { email }] })
  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists")
  }
  console.log(req.files);
  //4  
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLoaclPath = req.files?.coverImage[0]?.path;

  let coverImageLoaclPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLoaclPath = req.files.coverImage[0].path
  }
  if (!avatarLocalPath) {
    throw new ApiError(404, "Avatar file is required")
  }
  //5
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLoaclPath)
  if (!avatar) {
    throw new ApiError(404, "Avatar file is required")
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username,
  })
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken")
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }
  return res.status(201).json(
    new ApiResponse(200, createdUser, "user Registered Successfully",)
  )

})

const loginUser = asyncHandler(async (req, res) => {
  //req.body = data
  //username/email for validation
  //find the user
  //if user don't exist then redirect to register
  //if exist then access token and refresh token
  //send cookie and response that login successfully

  const { email, password, username } = req.body
  console.log(email)
  if (!username && !email) {
    throw new ApiError(404, "username or email is required")
  }
  const user = await User.findOne({
    $or: [{ username }, { email }]
  }).select("+password")
  if (!user) {
    throw new ApiError(404, "User does not exist")
  }
  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const option = {
    httpOnly: true,
    secure: true
  }
  res.
    status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User Logged in successfully"
      )
    )

})

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )
  const option = {
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)
  .clearCookie("accessToken",option)
  .clearCookie("refreshToken",option)
  .json(new ApiError(200,{},"User logged out"))

})
export { registerUser, loginUser, logOutUser }