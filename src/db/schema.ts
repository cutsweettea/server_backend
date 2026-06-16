import {
  pgTable,
  integer,
  varchar,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import {
  ARTIST_MAX_LEN,
  AUDIO_SRC_MAX_LEN,
  BIO_MAX_LEN,
  COVER_SRC_MAX_LEN,
  DEFAULT_PFP_URL,
  DEFAULT_THEME,
  ICON_LINK_MAX_LEN,
  ICON_LINK_TYPE_MAX_LEN,
  LOGIN_NAME_MAX_LEN,
  PFP_URL_MAX_LEN,
  PGP_MAX_LEN,
  PWD_HASH_MAX_LEN,
  REFER_MAX_LEN,
  REG_LINK_MAX_LEN,
  SESSION_ID_LEN,
  SESSION_NAME_MAX_LEN,
  SONG_ID_LIST_MAX_LEN,
  SONG_NAME_MAX_LEN,
  TAG_MAX_LEN,
  USER_NAME_MAX_LEN,
} from "../consts.ts";
import { sql } from "drizzle-orm";
import { type Theme } from "./interfaces.ts";

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
  pfp_url: varchar({ length: PFP_URL_MAX_LEN })
    .default(DEFAULT_PFP_URL)
    .notNull(),
  bio: varchar({ length: BIO_MAX_LEN }),
  songs: varchar({ length: SONG_ID_LIST_MAX_LEN }),
  theme: jsonb("theme").$type<Theme>().notNull().default(DEFAULT_THEME),
});

export const referralsTable = pgTable("refers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uid: integer()
    .notNull()
    .references(() => usersTable.id),
  uses: integer().notNull().default(0),
  max_uses: integer().notNull().default(1),
  link: varchar({ length: REG_LINK_MAX_LEN }).notNull().unique(),
});

export const sessionsTable = pgTable("sessions", {
  id: varchar({ length: SESSION_ID_LEN }).primaryKey(),
  uid: integer()
    .notNull()
    .references(() => usersTable.id),
  name: varchar({ length: SESSION_NAME_MAX_LEN }).notNull(),
  expiry: timestamp()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP + INTERVAL '8 HOUR'`),
});

export const userLinksTable = pgTable("user_links", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uid: integer()
    .notNull()
    .references(() => usersTable.id),
  type: varchar({ length: ICON_LINK_TYPE_MAX_LEN }).notNull(),
  redir: varchar({ length: ICON_LINK_MAX_LEN }).notNull(),
});

export const usersSongsTable = pgTable("user_songs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uid: integer()
    .notNull()
    .references(() => usersTable.id),
  name: varchar({ length: SONG_NAME_MAX_LEN }).notNull(),
  artist: varchar({ length: ARTIST_MAX_LEN }).notNull(),
  cover_src: varchar({ length: COVER_SRC_MAX_LEN }).notNull(),
  audio_src: varchar({ length: AUDIO_SRC_MAX_LEN }).notNull(),
  created: timestamp().notNull().defaultNow(),
});
