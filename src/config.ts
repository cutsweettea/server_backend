import dotenv from 'dotenv';

// load .env
dotenv.config({ quiet: true });

interface Conf {
    port: number,
    prod: boolean,
    dbConnDev: string
}

if(!process.env.PORT) throw new Error('port not defined');
if(!process.env.PROD) throw new Error('production not defined');
if(!process.env.DB_CONN_DEV) throw new Error('db dev connection not defined');

// setup environ
const conf: Conf = {
    port: Number(process.env.PORT) || 3130,
    prod: (process.env.PROD === '0' ? false : true),
    dbConnDev: process.env.DB_CONN_DEV
}

export default conf;