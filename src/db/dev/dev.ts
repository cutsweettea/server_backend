import Users from "./user.ts";
import Database from "../database.ts";
import Refers from "./refer.ts";

export default class Dev {
    private users: Users;
    private refers: Refers;

    constructor(db: Database) {
        this.users = new Users(db);
        this.refers = new Refers(db);
    }

    public getUsers() {
        // yep yep yep
        return this.users;
    }

    public getRefers() {
        // no problem u can have it
        return this.refers;
    }
}