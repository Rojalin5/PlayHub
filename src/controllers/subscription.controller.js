import { Subscription } from "../models/subscriptions.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggelSubscription = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params;
        if (!channelId) {
            throw new ApiError(400, "ChannelId is required")
        }
        const userId = req.user._id;
        if (channelId.toString() === userId.toString()) {
            throw new ApiError(400, "You can't subscribe to yourself")
        }
        const subscriberExists = await Subscription.findOne(
            {
                subscriber: userId,
                channel: channelId
            })

        if (subscriberExists) {
            await Subscription.findByIdAndDelete(subscriberExists._id)
            return res.status(200).json(
                new ApiResponse(200, null, "Unsubscribed successfully")
            )
        }
        const newSubscriber = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })
        if (!newSubscriber) {
            throw new ApiError(500, "Subscription failed. Please try again.");
        }
        return res.status(200).json(
            new ApiResponse(200, newSubscriber, "Subscribed successfully")
        )
    }
    catch (error) {
        res.status(500).json(
            {
                success: false,
                message: error.message || "Internal Server Error"
            }
        )
    }
})

//return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params;
        if (!channelId) {
            throw new ApiError(400, "ChannelId is required")
        }
        const subscribersList = await Subscription.find({ channel: channelId })
            .populate("subscriber", "username email fullName avatar")
            .select("subscriber createdAt")

        if (!subscribersList || subscribersList.length === 0) {
            throw new ApiError(200,"No subscribers found")
        }
        return res.status(200).json(
            new ApiResponse(200, subscribersList, "Subscribers fetched Successfully", {
                TotalSubscribers: subscribersList.length
            })
        )

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: error.message || "Internal Server Error"
            }
        )
    }
})
//return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    try {
        const { subscriberId } = req.params;
        if (!subscriberId) {
            throw new ApiError(404, "SubscriberId is required")
        }

        const channelList = await Subscription.find({ subscriber: subscriberId })
            .populate("channel", "username email fullname avatar")
            .select("channel createdAt")
        if (!channelList || channelList.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], "No channels found", { TotalChannels: 0 })
            );
        }
        return res.status(200).json(
            new ApiResponse(200, channelList, "Channel List fetched Successfully", {
                TotalChannels: channelList.length
            })
        )

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: error.message || "Internal Server Error"
            }
        )
    }
})
export { toggelSubscription, getUserChannelSubscribers, getSubscribedChannels }