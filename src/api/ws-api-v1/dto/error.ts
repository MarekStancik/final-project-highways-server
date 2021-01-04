export class WsApiError extends Error {

    public code: string;
    public sequenceId: string;

    constructor(message: string, code?: string, sequenceId?: string) {
        super(message);
        this.code = code || null;
        this.sequenceId = sequenceId || null;
    }
}
