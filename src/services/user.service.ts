import { OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { User } from "../models";
import { AuthenticationService } from "./authentication.service/authentication.service";
import { ObjectService } from "./object.service";

@Singleton
@OnlyInstantiableByContainer
export class UserService extends ObjectService<User>{
    constructor() {
        super("user")
    }

    public async list(query?: any): Promise<User[]> {
        const list = await super.list(query);
        list.forEach(u => this.stripPassword(u))
        return list;
    }

    public create(obj: User): Promise<User> {
        obj.password = AuthenticationService.passHash(obj.password);
        return super.create(obj);
    }

    public async update(obj: User): Promise<User> {
        if (obj.password) {
            obj.password = AuthenticationService.passHash(obj.password);
        } else {
            const original = (await super.list({id: obj.id}))[0];
            if (!original) {
                throw Error("Updated User does not exists");
            }
            obj.password = original.password;
        }
        const updated = await this.db.update(this.entityType,obj);
        this.eventBus.emit("update",this.entityType,this.stripPassword(obj));
        return updated;
    }

    private stripPassword(user: User): User{
        user.password = null;
        return user;
    }
}