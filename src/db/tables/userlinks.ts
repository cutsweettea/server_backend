import { eq } from "drizzle-orm";
import Database from "../database.ts";
import { type UserLink } from "../interfaces.ts";
import { userLinksTable } from "../schema.ts";
import { ACCOUNT_GET_LINKS_FAIL, ALLOWED_ICON_TYPES_LIST } from "../../consts.ts";
import { type ALLOWED_ICON_TYPES } from "../../consts.ts";

export default class UserLinks {
    private db: Database;
    
    constructor(db: Database) {
        this.db = db;
    }

    public async getUserLinks(uid: number): Promise<UserLink[]> {
        let select_res;
        try {
            select_res = await this.db.getDb().select()
            .from(userLinksTable)
            .where(eq(userLinksTable.uid, uid));
        } catch(e) {
            console.log(e);
            return Promise.reject(ACCOUNT_GET_LINKS_FAIL);
        }

        let final_list: UserLink[] = [];
        for(let i = 0; i < select_res.length; i++) {
            const item = select_res[i];
            if(!item) continue;
            const item_type = item.type as ALLOWED_ICON_TYPES;
            if(!ALLOWED_ICON_TYPES_LIST.includes(item_type)) continue;

            const ul: UserLink = {
                id: item.id,
                uid: item.uid,
                type: item_type,
                redir: item.redir
            };

            final_list.push(ul);
        }

        return Promise.resolve(final_list);
    }
}