class ApiErrors extends Error {
    constructor(message, statusCode, stack="", error =[]){
        super(message);
        this.statusCode = statusCode;
        this.stack = stack;
        this.error = error;
        this.data = null;
        this.success = false;
        
        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {ApiErrors};