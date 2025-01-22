class ApiError extends Error {
    constructor(
        statusCode,
        message = "something Went Wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.stackCode = statusCode
        this.data = null
        this.message = message
        this.errors = errors
        this.success = false
        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }