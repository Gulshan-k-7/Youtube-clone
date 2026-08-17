class ApiErrors extends Error {
    constructor(message, statusCode, statck="", error =[]){
        super(message);
        this.statusCode = statusCode;
        this.statck = statck;
        this.error = error;
        this.data = null;
        this.success = false;
        
        if(statck){
            this.stack = statck;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {ApiErrors};