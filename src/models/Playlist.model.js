import mongoose,{Schema} from "mongoose";

const playlistSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    videos:[
        {
            type: Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User"
    }
    
},{timestamps})

export const Playlist = new mongoose.model("Playlist", playlistSchema)