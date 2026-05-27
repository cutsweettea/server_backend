import { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { IUsers } from "../interfaces.ts";
import Database from "../database.ts";
import { defaultHash, extractSalt } from "../../util.ts";
import { usersTable } from "../schema.ts";

export default class Users implements IUsers {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    public async createUser(login_name: string, user_name: string, pwd: string, refer: string, tag: string, rank: number, pgp?: string, pfp_url?: string, bio?: string): Promise<string> {
        // hash password and extract salt
        const pwd_info = await extractSalt(await defaultHash(pwd));
        
        console.log(`creating account with ln=${login_name}, usn=${user_name}, tag=${tag}, pwd=${pwd_info.hash}, salt=${pwd_info.salt} pgp=${pgp}, rank=${rank}, refer=${refer}, pfp_url=${pfp_url}, bio=${bio}`);
        let insert_res;
        try {
            insert_res = await this.db.getDb().insert(usersTable)
            .values({
                login_name,
                user_name,
                pwd_hash: pwd_info.hash,
                refer,
                tag,
                rank,
                pgp,
                pfp_url,
                bio
            }).returning();
        } catch(e) {
            console.log(e);
            return Promise.reject('failed creating account');
        }

        if(insert_res.length == 0) return Promise.reject('created zero records');
        return Promise.resolve(pwd_info.salt);
    }
}