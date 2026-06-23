import { eq } from "drizzle-orm";
import Database from "../database.ts";
import { discordReferralsTable } from "../schema.ts";
import { type DiscordRef } from "../interfaces.ts";
import {
  DISCORD_REF_CREATE_FAIL,
  DISCORD_REF_DELETE_FAIL,
  DISCORD_REF_GET_FAIL,
} from "../../consts.ts";
import { genRandom } from "../../util.ts";

export default class Discord {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getRef(id: string): Promise<DiscordRef> {
    let select_res;
    try {
      select_res = await this.db
        .getDb()
        .select()
        .from(discordReferralsTable)
        .where(eq(discordReferralsTable.id, id));
    } catch (e) {
      return Promise.reject(DISCORD_REF_GET_FAIL);
    }

    if (select_res.length == 0) return Promise.reject(DISCORD_REF_GET_FAIL);
    const ref = select_res[0];

    if (!ref) return Promise.reject(DISCORD_REF_GET_FAIL);

    const cdate = new Date();
    cdate.setHours(cdate.getHours() - 4);
    console.log(
      `${ref.expiry} ?<= ${cdate} ? ${ref.expiry.getTime() <= cdate.getTime()}`,
    );
    if (ref.expiry.getTime() <= cdate.getTime()) {
      console.log("expired");
      return Promise.reject(DISCORD_REF_GET_FAIL);
    }
    return ref;
  }

  public async deleteRef(id: string): Promise<void> {
    let delete_res;
    try {
      delete_res = await this.db
        .getDb()
        .delete(discordReferralsTable)
        .where(eq(discordReferralsTable.id, id))
        .returning();
    } catch (e) {
      return Promise.reject(DISCORD_REF_DELETE_FAIL);
    }

    if (delete_res.length == 0) return Promise.reject(DISCORD_REF_DELETE_FAIL);
    return Promise.resolve();
  }

  public async createRef(info_hash: string): Promise<string> {
    const id = genRandom(16);
    let insert_res;
    try {
      insert_res = await this.db
        .getDb()
        .insert(discordReferralsTable)
        .values({
          id: id,
          info: info_hash,
        })
        .returning();
    } catch (e) {
      return Promise.reject(DISCORD_REF_CREATE_FAIL);
    }

    if (insert_res.length == 0) return Promise.reject(DISCORD_REF_CREATE_FAIL);
    return Promise.resolve(id);
  }
}
