import { pgTable, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { BIO_MAX_LEN, LOGIN_NAME_MAX_LEN, PFP_URL_MAX_LEN, PGP_MAX_LEN, PWD_HASH_MAX_LEN, REFER_MAX_LEN, TAG_MAX_LEN, USER_NAME_MAX_LEN } from "../consts";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    login_name: varchar({ length: LOGIN_NAME_MAX_LEN }).notNull().unique(),
    user_name: varchar({ length: USER_NAME_MAX_LEN }).notNull().unique(),
    tag: varchar({ length: TAG_MAX_LEN }).notNull(),
    pwd_hash: varchar({ length: PWD_HASH_MAX_LEN }).notNull(),
    pgp: varchar({ length: PGP_MAX_LEN }),
    rank: integer().default(0).notNull(),
    created: timestamp().defaultNow().notNull(),
    refer: varchar({ length: REFER_MAX_LEN }).notNull(),
    pfp_url: varchar({ length: PFP_URL_MAX_LEN }).default('none').notNull(),
    bio: varchar({ length: BIO_MAX_LEN })
});