export {aysncHandler} 

// const asyncHandler = (fn) => (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch(next);
// }


const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);   
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });                                                                                                     
        next(err);
    }   
}