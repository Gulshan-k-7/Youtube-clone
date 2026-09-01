import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/get-channel-states/:channelId").post(getChannelStats);
router.route("/get-channel-videos/:channelId").post(getChannelVideos);

export default router;