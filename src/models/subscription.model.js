import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber:{
            type: Schema.Type.ObjectId,
            ref:"User"
        },
        channel:{
            type: Schema.Type.ObjectId,
            ref:"User"
        }
    },{ timestamps:true}

)

export const Subscription = mongoose.model("Subscription", subscriptionSchema)