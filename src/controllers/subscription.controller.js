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

const getUserChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;
    const subscribers = await Subscription.find({channel:channelId})
    .populate("subscriber","username email fullname avatar")
    .select("subscriber createdAt")

    if(!subscribers === 0){
        throw new ApiError(404,"No subscribers found")
    }
    return res.status(200).json(
        new ApiResponse(200,subscribers,"Subscribers fetched Successfully",{
            TotalSubscribers: subscribers.length
        })
    )
})
export {toggelSubscription,getUserChannelSubscribers}