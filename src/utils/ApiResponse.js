class ApiResponse {
    constructor(statusCode, data, message = "Success",pagonation = null){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
        if(pagonation){
            this.pagonation = pagonation
        }
    }
}

export {ApiResponse}