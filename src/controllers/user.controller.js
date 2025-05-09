import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // Save the refresh token in the user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return both tokens
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error); // Log the error to see more details
    throw new ApiError(500, "Something went wrong while generating access and refresh token");
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
  console.log(avatarLocalPath)
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
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )
  const option = {
    httpOnly: true,
    secure: true
  }
  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiError(200, {}, "User logged out"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")
  }
  try {
    const decodedToken = jwt.verify
      (incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id)
    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }
    const option = {
      httpOnly: true,
      secure: true
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    return res.status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json(
        new ApiResponse(200, { accessToken, refreshToken}, "Access token refreshed")
      )

  }
  catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPS } = req.body;
  if (!(confirmPS === newPassword)) {
    throw new ApiError(401, "Password Doesn't Match")
  }
  const user = await User.findById(req.user?._id)

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Current Password")
  }
  user.password = newPassword
  user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email,username } = req.body

  if (!fullName && !email || !username) {
    throw new ApiError(400, "Atleast one fields is required.")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
        username
      }
    },
    { new: true }
  ).select("-password")
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated Successfully!"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    { new: true }).select("-password")
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"))
  //task : delete previous avatar
})
const updateUsercoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path
  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image file is missing")
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on cover image")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    { new: true }).select("-password")
  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage updated successfully"))
})

const getuserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "username is missing.")
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ])
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists")
  }
  return res.status(200)
    .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))
})
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        // _id: new mongoose.Types.ObjectId(req.user._id)
        _id: req.user._id
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [{
                $project: {
                  fullName: 1,
                  username: 1,
                  avatar: 1
                }
              }]
            }
          },
          {
            $addFields:{
              owner:{
                $first: "$owner"
              }
            }
          }
        ]
      }
    }

  ])
  return res.status(200).json(
    new ApiResponse(200,user[0].watchHistory,"Watch History fetched Successfully")
  )
})
export { registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUsercoverImage, getuserChannelProfile, getWatchHistory }
