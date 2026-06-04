import express from 'express';
import RouteRegistrar from './routes/registrar.ts';
import conf from './config.ts';
import cookieParser from 'cookie-parser';
import { generateResponse } from './util.ts';
import Database from './db/database.ts';
import { defCreateAccount } from './routes/default/users.ts';
import { adminCreateAccount } from './routes/admin/users.ts';
import z from 'zod';
import { ADMIN_ACCOUNT_CREATE_BODY_STRUCT, ACCOUNT_CREATE_BODY_STRUCT, ADMIN_SESSION, BIO_FIELD, LOGIN_NAME_FIELD, PFP_URL_FIELD, PGP_FIELD, PWD_FIELD, RANK_FIELD, REFER_FIELD, TAG_FIELD, USER_NAME_FIELD, ADMIN_REFER_CREATE_BODY_STRUCT, DEV_REFER_USE_BODY_STRUCT, DEV_REFER_SET_BODY_STRUCT, ACCOUNT_LOGIN_BODY_STRUCT, ACCOUNT_LOGIN_FAIL } from './consts.ts';
import { devCreateAccount } from './routes/dev/users.ts';
import { devCreateReferral, devSetReferralUses, devUseReferral } from './routes/dev/refers.ts';
import cors from 'cors';
import defLogin from './routes/default/sessions.ts';

// setup server and middleware
const serv = express();
serv.use(express.json({ limit: '25kb' }));
serv.use(cookieParser(conf.cookieSecret));
serv.use(cors({
    origin: conf.prod ? 'https://divine.frl' : 'http://localhost:5173',
    credentials: true
}))

// setup db
const db = new Database();

// setup routes
const rr = new RouteRegistrar(serv, db);

async function registerRoutes() {
    // for-production routes

    // account creation
    await rr.post({
        path: '/account/create',
        defCallbackOpts: {
            callback: defCreateAccount,
            requiredBodyValues: ACCOUNT_CREATE_BODY_STRUCT,
        }
    });

    await rr.post({
        path: '/account/login',
        defCallbackOpts: {
            callback: defLogin,
            requiredBodyValues: ACCOUNT_LOGIN_BODY_STRUCT
        },
        genericResponse: ACCOUNT_LOGIN_FAIL
    })

    // non-production routes
    await rr.post({
        path: '/dev/account/create',
        defCallbackOpts: {
            callback: devCreateAccount,
            requiredBodyValues: ADMIN_ACCOUNT_CREATE_BODY_STRUCT
        },
        dev: true
    });

    await rr.post({
        path: '/dev/refer/create',
        defCallbackOpts: {
            callback: devCreateReferral,
            requiredBodyValues: ADMIN_REFER_CREATE_BODY_STRUCT
        },
        dev: true
    });

    await rr.post({
        path: '/dev/refer/use',
        defCallbackOpts: {
            callback: devUseReferral,
            requiredBodyValues: DEV_REFER_USE_BODY_STRUCT
        },
        dev: true
    });

    await rr.post({
        path: '/dev/refer/set_uses',
        defCallbackOpts: {
            callback: devSetReferralUses,
            requiredBodyValues: DEV_REFER_SET_BODY_STRUCT
        },
        dev: true
    });
}

registerRoutes();

serv.listen(conf.port, () => {
    console.log(`listening on port ${conf.port} with prod=${conf.prod}`);
    console.log(`registered ${rr.routeCount()} routes`);
});
