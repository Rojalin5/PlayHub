import { channel } from "diagnostics_channel";
import { Subscription } from "../models/subscriptions.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

export {toggelSubscription}