import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import conf from "../config.ts";
import { sql } from "drizzle-orm";
import Users from "./tables/user.ts";
import Refers from "./tables/refer.ts";

export default class Database {
    private db: NodePgDatabase;
    private users: Users;
    private refers: Refers;

    constructor() {
        // connect with da drizzleanator
        this.db = drizzle(new Pool({
            connectionString: conf.dbConnDev
        }));

        this.testDbConnection();

        this.users = new Users(this);
        this.refers = new Refers(this);
    }

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

    public getDb(): NodePgDatabase {
        // what u think this do
        return this.db;
    }

    public getUsers(): Users {
        // do i need to write comments for these, no. will i, yes
        return this.users;
    }

    public getRefers(): Refers {
        // yep ill continue writing comments thank u
        return this.refers;
    }
}