/**
 * Domain error with an HTTP status and its own message (a catalog key or text).
 * The services throw AppError to signal 404/409/etc. without depending on
 * req/res; the error middleware turns it into a JSON response.
 */
export class AppError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "AppError";
        this.status = status;
    }
}
