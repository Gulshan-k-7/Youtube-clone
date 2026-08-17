import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avtar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            },
        ],  
        refreshToken: {
            type: String,
        },
    },{timestamps: true}
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }   
    this.password = await bcrypt.hash(this.password, 10);
    next();
})
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}  
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign
    ({
         id: this._id,
         email: this.email,
         userName: this.username,
         fullName: this.fullName
         }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
}
export const User = mongoose.model("User", userSchema);