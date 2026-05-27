import express from 'express';
import { generateResponse } from '../util.ts';
import Database from '../db/database.ts';
import z from 'zod';

export interface RouteCallbackProps {
    req: express.Request,
    res: express.Response,
    db: Database
}

export interface RouteCallback {
    ({ req, res, db }: RouteCallbackProps): express.Response
}

interface RegistrationProps {
    path: string,
    type: RequestType,
    callbackOpts: RouteCallbackOptions
}

interface RegistrationSetTypeProps {
    path: string,
    defCallbackOpts?: RouteCallbackOptions
    adminCallbackOpts?: RouteCallbackOptions
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

    private async defaultHandler(req: express.Request, res: express.Response, opts: RouteCallbackOptions, db: Database) {
        if(opts.requiredBodyValues) {
            // checks if body exists duhh
            if(!req.body) return res.status(400).send(generateResponse(false, 'no body brah'));

            // body check dat
            let bc = await opts.requiredBodyValues.safeParseAsync(req.body);
            if(!bc.success) return res.status(400).send(generateResponse(false, 'missing body value'))
        }

        if(opts.requiredCookies) {
            // only check for signed cookies
            if(!req.signedCookies) return res.status(400).send(generateResponse(false, 'no cookies'));

            // body check yay
            let bc = await opts.requiredCookies.safeParseAsync(req.signedCookies);
            if(!bc.success) return res.status(400).send(generateResponse(false, 'missing cookie value'));
        }

        // callback if everything succeeds
        opts.callback({ req, res, db });
    }

    private async registerRoute({ path, type, callbackOpts }: RegistrationProps): Promise<boolean> {
        // check if path is already registered, return false if so
        if(this.registeredPaths.includes(path)) return Promise.reject(`path ${path} already registered`);

        // auughh switch case case case
        switch(type) {
            case RequestType.GET: 
                this.serv.router.get(path, async (req, res) => await this.defaultHandler(req, res, callbackOpts, this.db));
                break;
            case RequestType.POST: 
                this.serv.router.post(path, async (req, res) => await this.defaultHandler(req, res, callbackOpts, this.db));
                break;
            case RequestType.PATCH: 
                this.serv.router.patch(path, async (req, res) => await this.defaultHandler(req, res, callbackOpts, this.db));
                break;
            case RequestType.OPTIONS: 
                this.serv.router.options(path, async (req, res) => await this.defaultHandler(req, res, callbackOpts, this.db));
                break;
            default: return Promise.reject(`unknown request type ${type}`);
        }

        this.registeredPaths.push(path);
        return true;
    }

    public async register(path: string, type: RequestType, defCallbackOpts?: RouteCallbackOptions, adminCallbackOpts?: RouteCallbackOptions): Promise<boolean> {
        // setup results (admin is true cuz it may not exec)
        let def_res = true;
        let admin_res = true;
        try {
            if(defCallbackOpts) def_res = await this.registerRoute({ path, type, callbackOpts: defCallbackOpts });
            if(adminCallbackOpts) admin_res = await this.registerAdmin({ path, type, callbackOpts: adminCallbackOpts });
        } catch(e) {
            return Promise.reject(e);
        }

        // returns true when either default callback is set or admin callback is set
        return (def_res && admin_res) && (!(!defCallbackOpts) && !(!adminCallbackOpts));
    }

    public async get({ path, defCallbackOpts, adminCallbackOpts }: RegistrationSetTypeProps): Promise<boolean> {
        // simplified method to register GET route
        return await this.register(path, RequestType.GET, defCallbackOpts, adminCallbackOpts);
    }

    public async post({ path, defCallbackOpts, adminCallbackOpts}: RegistrationSetTypeProps): Promise<boolean> {
        // simplified method to register POST route
        return await this.register(path, RequestType.POST, defCallbackOpts, adminCallbackOpts);
    }

    public async registerDefault({ path, type, callbackOpts }: RegistrationProps): Promise<boolean> {
        // error if path starts with /admin
        if(path.startsWith('/admin')) {
            return Promise.reject(`path "${path}" cannot start with /admin`);
        }

        // register route
        return await this.registerRoute({ path, type, callbackOpts });
    }

    public async registerAdmin({ path, type, callbackOpts }: RegistrationProps) {
        // just register path with /admin in the front
        return await this.registerRoute({ path: `/admin${path}`, type, callbackOpts });
    }

    public getServer(): express.Application {
        // pretty self explanatory, dunno why im typing dis out
        return this.serv;
    }
}

export default RouteRegistrar;