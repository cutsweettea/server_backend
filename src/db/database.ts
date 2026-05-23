import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import conf from "../config.ts";
import { sql } from "drizzle-orm";

export default class Database {
    private db: NodePgDatabase;

    private async testDbConnection(): Promise<boolean> {
        // attempt to see if db is connected
        try {
            await this.db.execute(sql`SELECT 1`);
            console.log('db test succeeded');
            return true;
        } catch(err) {
            console.log(`db conn failed: ${err}`);
            return false;
        }
    }

    constructor() {
        // connect with da drizzleanator
        this.db = drizzle(new Pool({
            connectionString: conf.dbConnDev
        }));

        this.testDbConnection();
    }

    public getDb(): NodePgDatabase {
        // what u think this do
        return this.db;
    }
}