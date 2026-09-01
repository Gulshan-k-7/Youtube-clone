import Router from "express"
import { getUserChannelSubscribers, toggleSubscription, getSubscribedChannels } from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

router.route("/toggle-subscription/:channelId").post(verifyJWT, toggleSubscription)   
router.route("/get-subscribers/:channelId").post( getUserChannelSubscribers)   
router.route("/get-channel/:subscriberId").post( getSubscribedChannels)   

export default router