import { ACCOUNT_LOGIN_FAIL } from "../../consts.ts";
import { btoaNoPadding, defaultVerify, genRandom } from "../../util.ts";
import Database from "../database.ts";
import type { ISessions } from "../interfaces.ts";
import { sessionsTable } from "../schema.ts";

export default class Sessions implements ISessions {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    public async generateSession(uid: number): Promise<string> {
        const sid = genRandom(32);
        let insert_res;
        try {
            insert_res = await this.db.getDb().insert(sessionsTable)
            .values({
                id: sid,
                uid: uid,
                name: 'new session'
            }).returning();
        } catch(e) {
            console.log(e);
            return Promise.reject('failed generating session');
        }

        if(insert_res.length == 0) return Promise.reject('inserted zero records');
        return Promise.resolve(sid);
    }

    public async login(ln: string, pwd: string, salt: string): Promise<string> {
        let user;
        try {
            user = await this.db.getUsers().getUser(ln);
        } catch(e) {
            return Promise.reject(e);
        }

        let pwd_pieces = user.pwd_hash.split('$');
        pwd_pieces.splice(4, 0, btoaNoPadding(salt));
        let pwd_hash_full = pwd_pieces.join('$');
        
        let verified;
        try {
            verified = await defaultVerify(pwd_hash_full, pwd);
        } catch(e) {
            console.log(e);
            return Promise.reject(ACCOUNT_LOGIN_FAIL);
        }

        if(!verified) return Promise.reject(ACCOUNT_LOGIN_FAIL);

        let sid;
        try {
            sid = this.generateSession(user.id);
        } catch(e) {
            console.log(e);
            return Promise.reject(ACCOUNT_LOGIN_FAIL);
        }

        return Promise.resolve(sid);
    }
}