import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";




const CommentSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true
    },
    video:[{
        type: mongoose.Schema.Type.ObjectId,
        ref:"Video"
    }],
    owner:{
        type: mongoose.Schema.Type.ObjectId,
        ref:"User"
    }

},{timestamps:true}
)

CommentSchema.plugin(mongooseAggregatePaginate)
export const Comment = mongoose.model("Comment", CommentSchema)
