import { eq, lt, sql } from "drizzle-orm";
import Database from "../database.ts";
import { discordReferralsTable } from "../schema.ts";
import { type DiscordRefInfo, type DiscordRef } from "../interfaces.ts";
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
    try {
      await this.deleteOldRefs();
    } catch (e) {
      console.log(e);
      return Promise.reject(DISCORD_REF_GET_FAIL);
    }

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

    if (ref.expiry.getTime() <= cdate.getTime())
      return Promise.reject(DISCORD_REF_GET_FAIL);

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

  private async getRefsFromId(id: string): Promise<DiscordRef[]> {
    let select_res;
    try {
      select_res = await this.db
        .getDb()
        .select()
        .from(discordReferralsTable)
        .where(eq(sql`${discordReferralsTable.id}`, id));
    } catch (e) {
      console.log(e);
      return Promise.reject(DISCORD_REF_GET_FAIL);
    }

    return select_res;
  }

  private async deleteOldRefs(): Promise<void> {
    try {
      await this.db
        .getDb()
        .delete(discordReferralsTable)
        .where(lt(discordReferralsTable.expiry, sql`NOW()`));
    } catch (e) {
      console.log(e);
      return Promise.reject();
    }

    return Promise.resolve();
  }

  public async createRef(info: DiscordRefInfo): Promise<string> {
    try {
      await this.deleteOldRefs();
    } catch (e) {
      console.log(e);
      return Promise.reject(DISCORD_REF_GET_FAIL);
    }

    let existing_refs: DiscordRef[] = [];
    try {
      existing_refs = await this.getRefsFromId(info.id);
    } catch (e) {
      console.log(e);
      return Promise.reject(DISCORD_REF_GET_FAIL);
    }

    if (existing_refs.length > 0) return Promise.reject(DISCORD_REF_GET_FAIL);

    const id = genRandom(16);
    let insert_res;
    try {
      insert_res = await this.db
        .getDb()
        .insert(discordReferralsTable)
        .values({
          id: id,
          info: info,
        })
        .returning();
    } catch (e) {
      return Promise.reject(DISCORD_REF_CREATE_FAIL);
    }

    if (insert_res.length == 0) return Promise.reject(DISCORD_REF_CREATE_FAIL);
    return Promise.resolve(id);
  }
}
