import { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { IUsers, UserProps } from "../interfaces.ts";
import Database from "../database.ts";
import { defaultHash, extractSalt, genRandom } from "../../util.ts";
import { usersTable } from "../schema.ts";
import { id } from "zod/locales";
import { ACCOUNT_CREATE_FAIL, ACCOUNT_GET_FAIL, ACCOUNT_LOGIN_FAIL, SESSION_NOT_FOUND } from "../../consts.ts";
import { eq } from "drizzle-orm";

export default class Users implements IUsers {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    public async createUser(login_name: string, user_name: string, pwd: string, refer: string, rank?: number, tag?: string, pgp?: string, pfp_url?: string, bio?: string, skip_refer = false): Promise<string> {
        // hash password and extract salt
        const hash = await defaultHash(pwd);
        console.log(`og hash: ${hash}`);
        const pwd_info = await extractSalt(hash);

        if(login_name == user_name) return Promise.reject('login name must be different than username');

        if(!skip_refer) {
            // check if referral is valid
            let ref_valid;
            try {
                ref_valid = await this.db.getRefers().isValid(refer);
            } catch(e) {
                return Promise.reject(e);
            }

            if(!ref_valid) return Promise.reject('invalid referral');

            // if refer is valid, increase use by 1
            let increase_res;
            try {
                increase_res = await this.db.getRefers().useRefer(refer);
            } catch(e) {
                return Promise.reject(ACCOUNT_CREATE_FAIL);
            }

            if(!increase_res) return Promise.reject(ACCOUNT_CREATE_FAIL);
        }

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
            return Promise.reject(ACCOUNT_CREATE_FAIL);
        }

        // reject if nothing inserted or throws error
        if(insert_res.length == 0) return Promise.reject(ACCOUNT_CREATE_FAIL);
        return Promise.resolve(pwd_info.salt);
    }

    public async getUserByLoginName(ln: string): Promise<UserProps> {
        let select_res;
        try {
            select_res = await this.db.getDb().select()
            .from(usersTable)
            .where(eq(usersTable.login_name, ln));
        } catch(e) {
            console.error(e);
            return Promise.reject(ACCOUNT_GET_FAIL);
        }

        if(select_res.length == 0) return Promise.reject(ACCOUNT_GET_FAIL);
        const user = select_res[0];
        if(!user) return Promise.reject(ACCOUNT_GET_FAIL);
        return Promise.resolve(user);
    }

    public async getUser(uid: number): Promise<UserProps> {
        let select_res;
        try {
            select_res = await this.db.getDb().select()
            .from(usersTable)
            .where(eq(usersTable.id, uid));
        } catch(e) {
            console.error(e);
            return Promise.reject(ACCOUNT_GET_FAIL);
        }

        if(select_res.length == 0) return Promise.reject(ACCOUNT_GET_FAIL);
        const user = select_res[0];
        if(!user) return Promise.reject(ACCOUNT_GET_FAIL);
        return Promise.resolve(user);
    }

    public async getUserFromSession(sid: string): Promise<UserProps> {
        let sesh;
        try {
            sesh = await this.db.getSessions().getSession(sid);
        } catch(e) {
            console.error(e);
            return Promise.reject(SESSION_NOT_FOUND);
        }

        let user;
        try {
            user = await this.getUser(sesh.uid);
        } catch(e) {
            console.error(e);
            return Promise.reject(ACCOUNT_GET_FAIL);
        }

        return user;
    }
}
