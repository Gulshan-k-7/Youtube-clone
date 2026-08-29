import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiErrors } from "../utils/ApiErrors";

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber:{
            type: mongoose.Schema.Type.ObjectId,
            ref:"User"
        },
        channel:{
            type: mongoose.Schema.Type.ObjectId,
            ref:"User"
        }
    },{ timestamps:true}

)


export const Subscription = mongoose.model("Subscription", subscriptionSchema)