import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/Tweet.model.js"
import {User} from "../models/User.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {

    const { content } = req.body

    // Validate content
    if (!content?.trim()) {
        throw new ApiError(400, "Tweet content is required")
    }

    // Create tweet
    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    })

    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                tweet,
                "Tweet created successfully"
            )
        )
})

const getUserTweets = asyncHandler(async (req, res) => {

    const { userId } = req.params

    // Validate user id
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    // Get all tweets of that user
    const tweets = await Tweet.find({
        owner: userId
    })
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweets,
                "User tweets fetched successfully"
            )
        )
})

const updateTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params
    const { content } = req.body

    // Validate tweet id
    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    // Validate content
    if (!content?.trim()) {
        throw new ApiError(400, "Tweet content is required")
    }

    // Find tweet
    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Check ownership
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not allowed to update this tweet"
        )
    }

    // Update tweet
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: content.trim()
            }
        },
        {
            returnDocument: "after"
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTweet,
                "Tweet updated successfully"
            )
        )
})

const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params

    // Validate tweet id
    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    // Find tweet
    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Check ownership
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not allowed to delete this tweet"
        )
    }

    // Delete likes related to this tweet
    await Like.deleteMany({
        tweet: tweetId
    })

    // Delete tweet
    await Tweet.findByIdAndDelete(tweetId)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Tweet deleted successfully"
            )
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}