import {asyncHandler} from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiErrors } from '../utils/ApiErrors.js';

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



export { registerUser };