import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"



const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const owner = req.user?.id;
    const {content} = req.body;
    if(!videoId || !owner || !content){
        throw new ApiErrors(200, "all detail needed")
    }
    const comment = await Comment.create({
        video: videoId,
        owner,
        content
    })
    console.log(comment)
    return res.status(200,"comment successfully")


})

const updateComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const { content } = req.body;

    // Validate comment id
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiErrors(400, "Invalid comment id")
    }

    // Validate new comment content
    if (!content?.trim()) {
        throw new ApiErrors(400, "Comment content is required")
    }

    // Find comment
    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiErrors(404, "Comment not found")
    }

    // Check ownership
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiErrors(
            403,
            "You are not allowed to update this comment"
        )
    }

    // Update comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
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
                updatedComment,
                "Comment updated successfully"
            )
        )
})

const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params

    // Validate comment id
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    // Find comment
    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Check ownership
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not allowed to delete this comment"
        )
    }

    // Delete comment
    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Comment deleted successfully"
            )
        )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }