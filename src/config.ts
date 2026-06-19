import dotenv from "dotenv";

// load .env
dotenv.config({ quiet: true });

interface Conf {
  port: number;
  prod: boolean;
  cookieSecret: string;
  dbConnDev: string;
  devSecretHash: string;
  discordSecret: string;
}

// check if env variables are set
if (!process.env.PORT) throw new Error("port not defined");
if (!process.env.PROD) throw new Error("production not defined");
if (!process.env.CKSEC) throw new Error("cookie secret connection not defined");
if (!process.env.DB_CONN_DEV) throw new Error("db dev connection not defined");
if (!process.env.DEV_SEC_H)
  throw new Error("dev secret hash connection not defined");
if (!process.env.DC_SEC)
  throw new Error("discord secret connection not defined");

// setup config
const conf: Conf = {
  port: Number(process.env.PORT) || 3130,
  prod: process.env.PROD === "0" ? false : true,
  cookieSecret: process.env.CKSEC,
  dbConnDev: process.env.DB_CONN_DEV,
  devSecretHash: process.env.DEV_SEC_H,
  discordSecret: process.env.DC_SEC,
};

export default conf;
