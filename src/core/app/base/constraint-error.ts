export class ConstraintError extends Error {
    status: number;
    code: string;
    details: string;
    constructor(message: string, status: number = 400 , code:string = "BAD_REQUEST" , details: string = "bad request") {
        super(message);
        this.name = "ConstraintError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
