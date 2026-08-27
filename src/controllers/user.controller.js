import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiErrors } from '../utils/ApiErrors.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sync } from 'touch';






const genrateAccessAndRefreshToken = async (userId) => {
    try {
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
    } catch (error) {
        throw new ApiErrors(500, "Internal server error");
    }
}




const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;
    // console.log("email:", email);

    //check if all required fields are provided
    if ([username, email, password, fullName].some((field) =>
        field?.trim() === "")) {
        throw new ApiErrors(400, "All fields are required");
    }
    //check if user with the same email or username already exists
    const existedUser = await User.findOne({
        "$or": [{ username }, { email }]
    })
    // console.log("existedUser:", existedUser);
    if (existedUser) {
        throw new ApiErrors(409, "User with email or username already exists");
    }
    // console.log("req.files:",req.files);
    //check if avatar and coverImage files are provided
    // const coverImageLocalPath = req.files?.avatar?.[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if (!coverImageLocalPath) {
        throw new ApiErrors(400, "Avatar is required");
    }
    // console.log(`Avatar local path: ${coverImageLocalPath}`);
    //upload avatar and coverImage to cloudinary
    const avatar = await uploadOnCloudinary(coverImageLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);


    if (!avatar) {
        console.log(`Avatar upload failed ${avatar}`);
        throw new ApiErrors(400, "Avatar is required");
    }
    const user = await User.create({
        username: username.toLowerCase(),
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

    const options = {
        httpOnly: true,
        secure: true
    }


    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser, accessToken, refreshToken,
            },
                "User logged in successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(

        req.user.id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true
        }
    )
    const options = {
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

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword && !newPassword) {
        throw new ApiErrors(400, "Password field required")
    }
    const user = await findById(req.user?.id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiErrors(400, "invalid Old password")
    }

    user.password = newPassword
    user.save({ validateBeforeSave: false })

    return res
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            200, req.user, "current user feched successfuly "
        )
})
const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName && !email) {
        throw new ApiErrors(400, "fullName and email required")
    }
    const user = User.findByIdAndUpdate(
        req.body?.id,
        {
            email,
            fullName: fullName
        },
        { new: true }
    )
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account detail updated successfuly")
        )
})


const updateAvatar = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.files;
    if (!coverImageLocalPath) {
        throw new ApiErrors(400, "local path of avatar not founded")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiErrors(400, "Avatar Imagen  not uploaded ")
    }
    const user = await findByIdAndUpdate(req.body?.id,
        {
            $set: {
                avatar: coverImage.url
            }
        },
        { new: true }
    )
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Avatar updated successfuly")
        )
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.files;
    if (!coverImageLocalPath) {
        throw new ApiErrors(400, "local path of avatar not founded")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiErrors(400, "cover Image not uploaded ")
    }
    const user = await findByIdAndUpdate(req.body?.id,
        {
            $set: {
                avatar: coverImage.url
            }
        },
        { new: true }
    )
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Cover Image updated successfuly")
        )
})


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const username = req.params

    if (!username?.trim()) {
        throw new ApiErrors(400, "username not found")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subcribersCount: {
                    $size: "subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "subscribedTo"
                },
                isSubcribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }

            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }

    ])
    if (!channel?.length) {
        throw new ApiErrors(404, "channel does not exists")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "user fetched successfuly")
        )
})

const getWatchedHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "watchedHistory",
                foreignField: "_id",
                as: "watchHistory",

                pipeline:[ {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",

                    pipeline:[{
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }

                    }]
                },
                {
                    $addFields:{
                        owner:{
                            $first: "$owner"
                        }
                    }
                }
            ]

            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "watch history fetched successfuly")
    )
})

export {
    registerUser,                                                                                                                                 
    updateUserDetails,                                                                                                                                 
    loginUser,                                                                                                                                 
    logoutUser,                                                                                                                                 
    refreshAccessToken,                                                                                                                                 
    getCurrentUser,                                                                                                                                 
    changePassword,                                                                                                                                 
    updateCoverImage,                                                                                                                                 
    updateAvatar,                                                                                                                                 
    getUserChannelProfile,                                                                                                                                 
    getWatchedHistory                                                                                                                                 
                                             
}; 