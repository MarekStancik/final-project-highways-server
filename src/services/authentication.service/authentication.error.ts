export class AuthenticationError extends Error {

    public code: string;

    constructor(message: string, code?: string) {
        super(message);
        this.code = code || null;
    }
}
