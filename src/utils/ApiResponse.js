class ApiResponse {
    constructor(statusCode , data , message="Request successful" ){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400 ;  //If status code is less than 400 , then success is true else false
    }
}