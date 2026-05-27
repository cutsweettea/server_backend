import express from 'express';
import RouteRegistrar from './routes/registrar.ts';
import conf from './config.ts';
import cookieParser from 'cookie-parser';
import { generateResponse } from './util.ts';
import Database from './db/database.ts';
import { defCreateAccount } from './routes/default/users.ts';
import { adminCreateAccount } from './routes/admin/users.ts';

// setup server and middleware
const serv = express();
serv.use(express.json({ limit: '25kb' }));
serv.use(cookieParser(process.env.CKSEC));

// setup db
const db = new Database();

// setup routes
const rr = new RouteRegistrar(serv, db);

async function registerRoutes() {
    // account creation
    await rr.post({
        path: '/account/create',
        defCallbackOpts: {
            callback: defCreateAccount,
            requiredBodyValues: ['login_name', 'user_name', 'pwd', 'refer']
        },
        adminCallbackOpts: {
            callback: adminCreateAccount,
            requiredBodyValues: ['login_name', 'user_name', 'tag', 'pwd', 'pgp', 'rank', 'refer', 'pfp_url', 'bio'],
            requiredCookies: ['asid']
        }
    });
}

registerRoutes();

serv.listen(conf.port, () => {
    console.log(`listening on port ${conf.port} with prod=${conf.prod}`);
    console.log(`registered ${rr.routeCount()} routes`);
});