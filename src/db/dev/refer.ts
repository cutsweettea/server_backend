import Database from "../database.ts";
import type { IRefers } from "../interfaces.ts";
import { referralsTable } from "../schema.ts";

export default class Refers implements IRefers {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }
    
    public async createRefer(uid: number, link: string, max_uses: number): Promise<boolean> {
        let insert_res;
        try {
            insert_res = await this.db.getDb().insert(referralsTable)
            .values({
                uid,
                link,
                max_uses
            }).returning();
        } catch(e) {
            console.log(e);
            return Promise.reject('failed creating referral');
        }

        if(insert_res.length == 0) return Promise.reject('inserted zero records');
        return Promise.resolve(true);
    }
}