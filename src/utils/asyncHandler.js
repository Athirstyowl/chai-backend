export const asyncHandler = (requestHandler) => { //requestHandler is a parameter function
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
    }
}

// const asyncHandler = () => ( () => {})  //higher order function
    // const asyncHandler2 = (fn) => async (req, res, next) => {
    //     try {
    //         await fn(req, res, next)
    //     } catch (error) {
    //         res.status(error.code || 500).json({
    //             success: false,
    //             message: error.message
    //         })
    //     }
    // }