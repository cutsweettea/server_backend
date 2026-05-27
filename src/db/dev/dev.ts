import { NodePgDatabase } from "drizzle-orm/node-postgres";
import Users from "./user.ts";
import Database from "../database.ts";

export default class Dev {
    private users: Users;

    constructor(db: Database) {
        this.users = new Users(db);
    }

    public getUsers() {
        // yep yep yep
        return this.users;
    }
}