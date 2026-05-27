import { eq } from "drizzle-orm";
import Database from "../database.ts";
import type { IRefers, ReferProps } from "../interfaces.ts";
import { referralsTable } from "../schema.ts";

export default class Refers implements IRefers {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }
    
    public async createRefer(uid: number, link: string, max_uses: number): Promise<boolean> {
        // attempt insert
        let insert_res;
        try {
            insert_res = await this.db.getDb().insert(referralsTable).values({
                uid,
                link,
                max_uses
            }).returning();
        } catch(e) {
            console.error(e);
            return Promise.reject('failed creating referral');
        }

        // reject if nothing updates or throws error
        if(insert_res.length == 0) return Promise.reject('inserted zero refer records');
        return Promise.resolve(true);
    }

    public async getRefer(link: string): Promise<ReferProps> {
        // attempt select
        let select_res;
        try {
            select_res = await this.db.getDb().select()
            .from(referralsTable)
            .where(eq(referralsTable.link, link))
            .limit(1);
        } catch(e) {
            console.error(e);
            return Promise.reject('failed getting referral');
        }

        // reject if nothing was found
        if(select_res.length == 0) return Promise.reject('fetched zero refer records');
        const ref = select_res[0];

        // reject if referral is for some reason undefined
        if(!ref) return Promise.reject('null record');
        return ref;
    }

    public async isValid(link: string): Promise<boolean> {
        // get referral
        let ref;
        try {
            ref = await this.getRefer(link);
        } catch(e) {
            return Promise.reject(e);
        }
        
        // check if refer is valid
        let valid;
        try {
            valid = this.isValidFromData(ref);
        } catch(e) {
            return Promise.reject(e);
        }

        if(!valid) return Promise.resolve(false);
        return Promise.resolve(true);
    }

    private isValidFromData(data: ReferProps): boolean {
        // reject if use amount if >= the max amount allowed
        if(data.uses >= data.max_uses) return false;
        return true;
    }

    public async useRefer(link: string): Promise<boolean> {
        // check if referral is valid
        let ref;
        try {
            ref = await this.getRefer(link);
        } catch(e) {
            return Promise.reject(e);
        }

        let valid = this.isValidFromData(ref);
        if(!valid) return Promise.reject('invalid ref');

        // attempt update uses to +1
        let update_res;
        try {
            update_res = await this.db.getDb().update(referralsTable)
            .set({ uses: ref.uses+1 })
            .where(eq(referralsTable.link, link))
            .returning();
        } catch(e) {
            console.error(e);
            return Promise.reject('failed increasing ref uses');
        }

        // rejects if nothing updates or throws error
        if(update_res.length == 0) return Promise.reject('updated zero refer records');
        return Promise.resolve(true);
    }

    public async setReferUses(link: string, uses: number): Promise<boolean> {
        // attempt update to set refer uses to given amount
        let update_res;
        try {
            update_res = await this.db.getDb().update(referralsTable)
            .set({ uses })
            .where(eq(referralsTable.link, link))
            .returning();
        } catch(e) {
            console.error(e);
            return Promise.reject('failed setting ref uses');
        }

        // rejects if noting updates or throws error
        if(update_res.length == 0) return Promise.reject('updated zero refer records');
        return Promise.resolve(true);
    }
}