// Why making a asyncHandler function?
// Express does not natively catch errors thrown inside async functions 
// (routes or middleware). Without a utility, you’d have to wrap every 
// async function with try/catch, and use next(err) on error, which is repetitive.


//Way 1
const asyncHandler = (reqHandler) => {
    (req, res, next) => {
        Promise.resolve(reqHandler(req, res, next))       //resolving the promise returned by reqHandler
        .catch((err)=>next(err));           //throwing error to express default error handler or custom error handler
    }
}

export {asyncHandler};


//Way 2
    // Steps of Reaching till syntax of Higher Order Function
// const asyncHandler = fn = () => {}
// const asyncHandler = (fn) => () => {}
// const asyncHandler = (fn) => aync () => {} 

// const asyncHandler = (fn) => async (req , res , next) => {
//     try {
//         await fn(req , res , next);
//     }
//     catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message || "Something went wrong in asyncHandler",       //Sends a custom error message
//         });
//     }
// }