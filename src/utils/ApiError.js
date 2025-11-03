class ApiError extends Error {
    //Khud ka ek constructor banaya hai jisme hum status code , message , stack trace aur errors ko handle kar rahe hain
    //We are like making our own custom error class by extending the built-in Error class in JavaScript
    //So that now we recieve errors in this structured format only whenever we throw an error using this ApiError class

    constructor(statusCode , message="Something went wrong" , stack = "" , errors=[]) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = null;
        this.message = message;
        this.success = false;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this , this.constructor);
        }
    }
}

export {ApiError};