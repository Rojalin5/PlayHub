import { Router } from "express";
import { verifyJWT } from "../middlewares/authetication.middlewares.js";
import { toggelSubscription,getUserChannelSubscribers,getSubscribedChannels } from "../controllers/subscription.controller.js";

const router = Router()

router.route("/toggle/:subscriptionId").patch(verifyJWT,toggelSubscription)
router.route("/subscriberslist/:channelId").get(verifyJWT,getUserChannelSubscribers)
router.route("/channelslist/:subscriberId").get(verifyJWT,getSubscribedChannels)    

export default router;