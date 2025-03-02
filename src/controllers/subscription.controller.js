import { channel } from "diagnostics_channel";
import { Subscription } from "../models/subscriptions.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { populate } from "dotenv";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggelSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiError(400,"ChannelId is required")
    }
    const {userId} = req.user;

    if(channelId === userId){
        throw new ApiError(400,"You can't subscribe to yourself")
    }
    const subscriberExists = await Subscription.findOne(
        {
            subscriber: userId,
            channel:channelId
        })
    if(subscriberExists){
        await Subscription.findByIdAndDelete(subscriberExists._id)
        return res.status(200).json(
            new ApiError(200,"Unsubscribed successfully")
        )
    }
    await Subscription.create({
        subscriber:userId,
        channel:channelId
    })  
    await Subscription.save() 
    return res.status(200).json(
        new ApiError(200,"Subscribed successfully")
    )
})

//return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiError(400,"ChannelId is required")}
    const subscribersList = await Subscription.find({channel:channelId})
    .populate("subscriber","username email fullname avatar")
    .select("subscriber createdAt")

    if(!subscribersList.length === 0){
        throw new ApiError(404,"No subscribers found")
    }
    return res.status(200).json(
        new ApiResponse(200,subscribersList,"Subscribers fetched Successfully",{
            TotalSubscribers: subscribersList.length
        })
    )
})

//return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async(req,res)=>{
    const {subscriberId} = req.params;
    if(!subscriberId){
        throw new ApiError(404,"SubscriberId is required")
    }
    const channelList = await Subscription.find({subscriber:subscriberId})
    .populate("channel","username email fullname avatar")
    .select("channel createdAt")
    if(channelList.length === 0){
        throw new ApiError(400,"No Channel Found")
    }
    return res.status(200).json(
        new ApiResponse(200,channelList,"Channel List fetched Successfully",{
            TotalChannels: channelList.length
        })
    )
})
export {toggelSubscription,getUserChannelSubscribers,getSubscribedChannels}