import {asyncHandler} from '../utils/asyncHandler.js';
import { User } from '../models/User.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiErrors} from '../utils/ApiErrors.js';
import { ApiResponse } from '../utils/ApiResponse.js';






const genrateAccessAndRefreshToken = async (userId) => {
    try{ 
        const user = await User.findById(userId);
        console.log("user:", user)
        if (!user) {
            throw new ApiErrors(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
      
        return { accessToken, refreshToken };
    }catch (error) {
        throw new ApiErrors(500, "Internal server error");
    }
}




const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;
    // console.log("email:", email);

    //check if all required fields are provided
    if([username, email,password, fullName].some((field)=>
    field?.trim() === "")){
        throw new ApiErrors(400, "All fields are required");
    }
    //check if user with the same email or username already exists
    const existedUser = await User.findOne({
        "$or": [{username}, {email}]
    })
    // console.log("existedUser:", existedUser);
    if (existedUser) {
        throw new ApiErrors(409,"User with email or username already exists");
    }
    // console.log("req.files:",req.files);
    //check if avatar and coverImage files are provided
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray (req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if(!avatarLocalPath){
        throw new ApiErrors(400, "Avatar is required");
    }
    // console.log(`Avatar local path: ${avatarLocalPath}`);
    //upload avatar and coverImage to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    

    if(!avatar){
        console.log(`Avatar upload failed ${avatar}`);
        throw new ApiErrors(400, "Avatar is required");
    }
    const user = await User.create({
        username : username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });
    
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiErrors(500, "Something went wrong while creating the user");
    }

    return res.status(201).json({ success: true, message: "User created successfully", user: createdUser });
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!(username || email)) {
        throw new ApiErrors(400, "Username or email is required");
    }
    const user = await User.findOne({
        "$or": [{ username }, { email }]
    });

    if (!user) {
        throw new ApiErrors(404, "User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiErrors(401, "Invalid password");
    }
    const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

     const options={
        httpOnly: true,
        secure: true
    }


    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200,{
                user: loggedInUser, accessToken, refreshToken,    
            },
            "User logged in successfully"   
        )
    )

})

const logoutUser = asyncHandler(async(req, res)=>{
    c
    await User.findByIdAndUpdate(

        req.user.id,
        {
            $unset: {refreshToken: 1}
       },
       {
        new: true
       }
    )
    const options={
        httpOnly: true,
        secure: true
    }

return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
    

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?.id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


export { registerUser, loginUser, logoutUser, refreshAccessToken }; 