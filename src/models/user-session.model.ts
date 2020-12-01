export class UserSession {
    id: string;
    user: UserSpec;
    token: string;
    type: string;
    lifetime: number;
    startDate: Date;
    lastRequestDate: Date;
    expiryDate: Date;
    createDate: Date;
    updateDate: Date;
}

export class UserSpec {
    id: string
}