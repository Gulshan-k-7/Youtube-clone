import { User } from "../models/User.model"
import { ApiErrors } from "../utils/ApiErrors"
import { asyncHandler } from "../utils/asyncHandler"
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler( async(req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("bearer", "")
        if(!token){
            throw new ApiErrors(401,"unauthorize request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._Id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiErrors(401, "Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid Access Token"
        )
        
    }


})