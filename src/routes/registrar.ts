import express from 'express';
import { defaultHash, defaultVerify, generateResponse } from '../util.ts';
import Database from '../db/database.ts';
import z from 'zod';
import conf from '../config.ts';

export interface RouteCallbackProps {
    req: express.Request,
    res: express.Response,
    db: Database
}

export interface RouteCallback {
    ({ req, res, db }: RouteCallbackProps): Promise<express.Response>
}

interface RegistrationProps {
    path: string,
    type: RequestType,
    callbackOpts: RouteCallbackOptions,
    dev?: boolean,
    genericResponse?: string
}

interface RegistrationSetTypeProps {
    path: string,
    defCallbackOpts?: RouteCallbackOptions,
    adminCallbackOpts?: RouteCallbackOptions,
    dev?: boolean,
    genericResponse?: string
}

interface RouteCallbackOptions {
    callback: RouteCallback,
    requiredBodyValues?: z.ZodObject,
    requiredCookies?: z.ZodObject
}

// what the fuck is this
export const RequestType = {
    GET: 'GET',
    POST: 'POST',
    OPTIONS: 'OPTIONS',
    PATCH: 'PATCH'
} as const;
type RequestType = typeof RequestType[keyof typeof RequestType];

// my super duper awesome epic middleware type thing
class RouteRegistrar {
    private serv: express.Application;
    private db: Database;
    private registeredPaths: string[] = [];

    constructor(serv: express.Application, db: Database) {
        // construct this immediately!!!!
        this.serv = serv;
        this.db = db;
    }

    public routeCount(): number {
        // count up dem paths
        return this.registeredPaths.length;
    }

    private async defaultHandler(req: express.Request, res: express.Response, opts: RouteCallbackOptions, db: Database, dev?: boolean, genericResponse?: string) {
        console.debug(`default handling ${req.path}`);
        // returns 404 if its a dev route and app is in production
        if(dev && conf.prod) return res.sendStatus(404);

        // check if route is dev and not currently in production
        if(dev && !conf.prod) {
            // return 400 if no body then if no dev secret in body
            if(!req.body) return res.status(400).send(generateResponse(false, !genericResponse ? 'i need dat body' : genericResponse));
            if(!('dev_secret' in req.body)) return res.status(400).send(generateResponse(false, !genericResponse ? 'you know what i need' : genericResponse));

            // gets dev secret from body and checks it against hash in .env
            const sec = req.body.dev_secret;
            let verified;
            try {
                verified = await defaultVerify(conf.devSecretHash, sec);
            } catch(e) {
                console.log(e);
                return res.status(400).send(generateResponse(false, !genericResponse ? 'nah' : genericResponse));
            }

            if(!verified) return res.status(400).send(generateResponse(false, !genericResponse ? 'incorrect' : genericResponse));
        }

        if(opts.requiredBodyValues) {
            // checks if body exists duhh
            if(!req.body) return res.status(400).send(generateResponse(false, !genericResponse ? 'no body brah' : genericResponse));

            // body check dat
            let bc = await opts.requiredBodyValues.safeParseAsync(req.body);
            if(!bc.success) return res.status(400).send(generateResponse(false, !genericResponse ? JSON.parse(bc.error.message)[0].message : genericResponse));
        }

        const cookies = conf.prod ? req.signedCookies : req.cookies;
        if(opts.requiredCookies) {
            // only check for signed cookies
            if(!cookies) return res.status(400).send(generateResponse(false, !genericResponse ? 'no cookies' : genericResponse));

            // body check yay
            let bc = await opts.requiredCookies.safeParseAsync(cookies);
            if(!bc.success) return res.status(400).send(generateResponse(false, !genericResponse ? JSON.parse(bc.error.message)[0].message : genericResponse));
        }

        // callback if everything succeeds
        opts.callback({ req, res, db });
    }

    private async registerRoute({ path, type, callbackOpts, dev, genericResponse }: RegistrationProps): Promise<boolean> {
        // check if path is already registered, return false if so
        if(this.registeredPaths.includes(path)) return Promise.reject(`path ${path} already registered`);
        console.log(`registering path ${path} with type ${type}`);

        // auughh switch case case case
        switch(type) {
            case RequestType.GET: 
                this.serv.router.get(path, async (req, res) => await this.defaultHandler(req, res, callbackOpts, this.db, dev, genericResponse));
                break;
            case RequestType.POST: 
                this.serv.router.post(path, async (req, res) => await this.defaultHandler(req, res, callbackOpts, this.db, dev, genericResponse));
                break;
            case RequestType.PATCH: 
                this.serv.router.patch(path, async (req, res) => await this.defaultHandler(req, res, callbackOpts, this.db, dev, genericResponse));
                break;
            case RequestType.OPTIONS: 
                this.serv.router.options(path, async (req, res) => await this.defaultHandler(req, res, callbackOpts, this.db, dev, genericResponse));
                break;
            default: return Promise.reject(`unknown request type ${type}`);
        }

        this.registeredPaths.push(path);
        return true;
    }

    public async register(path: string, type: RequestType, defCallbackOpts?: RouteCallbackOptions, adminCallbackOpts?: RouteCallbackOptions, dev: boolean = false, genericResponse?: string): Promise<boolean> {
        // setup results (admin is true cuz it may not exec)
        let def_res = true;
        let admin_res = true;
        try {
            if(defCallbackOpts) def_res = await this.registerRoute({ path, type, callbackOpts: defCallbackOpts, dev, genericResponse });
            if(adminCallbackOpts) admin_res = await this.registerAdmin({ path, type, callbackOpts: adminCallbackOpts, dev, genericResponse });
        } catch(e) {
            return Promise.reject(e);
        }

        // returns true when either default callback is set or admin callback is set
        return (def_res && admin_res) && (!(!defCallbackOpts) && !(!adminCallbackOpts));
    }

    public async get({ path, defCallbackOpts, adminCallbackOpts, dev, genericResponse }: RegistrationSetTypeProps): Promise<boolean> {
        // simplified method to register GET route
        return await this.register(path, RequestType.GET, defCallbackOpts, adminCallbackOpts, dev, genericResponse);
    }

    public async post({ path, defCallbackOpts, adminCallbackOpts, dev, genericResponse }: RegistrationSetTypeProps): Promise<boolean> {
        // simplified method to register POST route
        return await this.register(path, RequestType.POST, defCallbackOpts, adminCallbackOpts, dev, genericResponse);
    }

    public async registerDefault({ path, type, callbackOpts, dev }: RegistrationProps): Promise<boolean> {
        // error if path starts with /admin
        if(path.startsWith('/admin')) {
            return Promise.reject(`path "${path}" cannot start with /admin`);
        }

        // register route
        return await this.registerRoute({ path, type, callbackOpts, dev });
    }

    public async registerAdmin({ path, type, callbackOpts, dev }: RegistrationProps) {
        // just register path with /admin in the front
        return await this.registerRoute({ path: `/admin${path}`, type, callbackOpts, dev });
    }

    public getServer(): express.Application {
        // pretty self explanatory, dunno why im typing dis out
        return this.serv;
    }
}

export default RouteRegistrar;