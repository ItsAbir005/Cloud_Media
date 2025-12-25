export class AppError extends Error {
    public status: number;
    public code: string;
    public details: any;

    constructor(code: string, message: string, details: any = null, status = 500) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
