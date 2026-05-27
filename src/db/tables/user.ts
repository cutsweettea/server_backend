import { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { IUsers } from "../interfaces.ts";
import Database from "../database.ts";
import { defaultHash, extractSalt, genRandom } from "../../util.ts";
import { usersTable } from "../schema.ts";
import { id } from "zod/locales";

export default class Users implements IUsers {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    public async createUser(login_name: string, user_name: string, pwd: string, refer: string, rank?: number, tag?: string, pgp?: string, pfp_url?: string, bio?: string, skip_refer = false): Promise<string> {
        // hash password and extract salt
        const pwd_info = await extractSalt(await defaultHash(pwd));

        // check if referral is valid
        let ref_valid;
        try {
            ref_valid = await this.db.getRefers().isValid(refer);
        } catch(e) {
            return Promise.reject(e);
        }

        if(!ref_valid) return Promise.reject('invalid ref');

        // if refer is valid, increase use by 1
        let increase_res;
        try {
            increase_res = await this.db.getRefers().useRefer(refer);
        } catch(e) {
            return Promise.reject(e);
        }

        if(!increase_res) return Promise.reject('failed increasing ref count');

        // generate random tag if not specified
        let set_tag;
        if(!tag) set_tag = genRandom(4).toUpperCase();
        else set_tag = tag;

        // attempt insert
        console.log(`creating account with ln=${login_name}, usn=${user_name}, tag=${tag}, pwd=${pwd_info.hash}, salt=${pwd_info.salt} pgp=${pgp}, rank=${rank}, refer=${refer}, pfp_url=${pfp_url}, bio=${bio}`);
        let insert_res;
        try {
            insert_res = await this.db.getDb().insert(usersTable)
            .values({
                login_name,
                user_name,
                pwd_hash: pwd_info.hash,
                refer,
                tag: set_tag,
                rank,
                pgp,
                pfp_url,
                bio
            }).returning();
        } catch(e) {
            console.log(e);
            return Promise.reject('failed creating account');
        }

        // reject if nothing inserted or throws error
        if(insert_res.length == 0) return Promise.reject('created zero records');
        return Promise.resolve(pwd_info.salt);
    }
}