import mongoose, {Schema} from "mongoose";



constlikeSchema = new Schema({
    comment:{
        type: Schema.type.ObjectId,
        ref: "Comment"
    },
    video:{
        type: Schema.type.ObjectId,
        ref: "Video"
    },
    tweet:{
        type: Schema.type.ObjectId,
        ref: "Tweet"
    },
    likedBy:{
        type: Schema.type.ObjectId,
        ref: "User"
    }
    

},{timestamps:true})

export const Like = mongoose.model("Like", likeSchema)