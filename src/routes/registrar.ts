import express from 'express';
import { generateResponse } from '../util.ts';

export interface RouteCallback {
    (req: express.Request, res: express.Response): express.Response
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
    requiredBodyValues?: string[],
    requiredCookies?: string[]
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
    private registeredPaths: string[] = [];

    constructor(serv: express.Application) {
        // construct this immediately!!!!
        this.serv = serv;
    }

    public routeCount(): number {
        // count up dem paths
        return this.registeredPaths.length;
    }

    private defaultHandler(req: express.Request, res: express.Response, opts: RouteCallbackOptions) {
        if(opts.requiredBodyValues) {
            // checks for required body values if specified
            if(!req.body) return res.status(400).send(generateResponse(false, 'no body brah'));
            for(let i = 0; i < opts.requiredBodyValues.length; i++) {
                // check for each value to see if in body, returning 400 status if not
                let v = opts.requiredBodyValues[i];
                if(!v) continue;
                if(!(v in req.body)) return res.status(400).send(generateResponse(false, 'missing body value'));
            }
        }

        if(opts.requiredCookies) {
            for(let i = 0; i < opts.requiredCookies.length; i++) {
                // check for each value to see if is cookie
                let v = opts.requiredCookies[i];
                if(!v) continue;
                if(!(v in req.signedCookies)) return res.status(400).send(generateResponse(false, 'missing cookie'));
            }
        }

        // callback if everything succeeds
        opts.callback(req, res);
    }

    private async registerRoute({ path, type, callbackOpts }: RegistrationProps): Promise<boolean> {
        // check if path is already registered, return false if so
        if(this.registeredPaths.includes(path)) return Promise.reject(`path ${path} already registered`);

        // auughh switch case case case
        switch(type) {
            case RequestType.GET: 
                this.serv.router.get(path, (req, res) => this.defaultHandler(req, res, callbackOpts));
                break;
            case RequestType.POST: 
                this.serv.router.post(path, (req, res) => this.defaultHandler(req, res, callbackOpts));
                break;
            case RequestType.PATCH: 
                this.serv.router.patch(path, (req, res) => this.defaultHandler(req, res, callbackOpts));
                break;
            case RequestType.OPTIONS: 
                this.serv.router.options(path, (req, res) => this.defaultHandler(req, res, callbackOpts));
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

    public async get({ path, defCallbackOpts, adminCallbackOpts}: RegistrationSetTypeProps): Promise<boolean> {
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