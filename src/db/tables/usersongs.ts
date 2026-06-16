import { and, eq, or } from "drizzle-orm";
import Database from "../database.ts";
import { type UserSong } from "../interfaces.ts";
import { usersSongsTable } from "../schema.ts";
import { ACCOUNT_SONGS_GET_FAIL } from "../../consts.ts";

function generateOrRecursive(songs: string[]) {
    let full_query;
    for(let i = 0; i < songs.length; i++) {
        let n;
        try {
            n = Number(songs[i]);
        } catch(e) { continue; }
        
        songs.splice(0, 1);
        full_query = or(eq(usersSongsTable.id, n), generateOrRecursive(songs));
    }

    return full_query;
}

export default class UserSongs {
    private db: Database;
    
    constructor(db: Database) {
        this.db = db;
    }

    public async getUserSongs(uid: number): Promise<UserSong[]> {
        let user;
        try {
            user = await this.db.getUsers().getUser(uid);
        } catch(e) {
            return Promise.reject(e);
        }

        if(!user.songs) return Promise.resolve([]);
        const songs = user.songs.split(',');

        let select_res;
        try {
            select_res = await this.db.getDb().select()
            .from(usersSongsTable)
            .where(generateOrRecursive(songs));
        } catch(e) {
            console.log(e);
            return Promise.reject(ACCOUNT_SONGS_GET_FAIL);
        }

        return select_res;
    }
}