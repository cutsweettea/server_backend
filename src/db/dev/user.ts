import { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { IUsers } from "../interfaces.ts";
import Database from "../database.ts";

export default class Users implements IUsers {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    public createUser(ln: string, usn: string, pwd: string, refer: string, tag: string, rank: number, pgp?: string, pfp_url?: string, bio?: string): Promise<boolean> {
        console.log(`creating account with ln=${ln}, usn=${usn}, tag=${tag}, pwd=${pwd}, pgp=${pgp}, rank=${rank}, refer=${refer}, pfp_url=${pfp_url}, bio=${bio}`);
        return Promise.resolve(true);
    }
}