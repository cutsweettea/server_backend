import express from 'express';
import { generateResponse } from '../util.ts';

interface RouteCallback {
    (req: express.Request, res: express.Response): express.Response
}

interface RegistrationProps {
    path: string,
    type: RequestType,
    callback: RouteCallback,
    requiredBodyValues?: string[]
}

interface RouteRegisterOptions {
    adminCallback?: RouteCallback,
    requiredBodyValuesDefault?: string[],
    requiredBodyValuesAdmin?: string[]
}

// what the fuck is this
export const RequestType = {
    GET: 'GET',
    POST: 'POST',
    OPTIONS: 'OPTIONS',
    PATCH: 'PATCH'
} as const;
type RequestType = typeof RequestType[keyof typeof RequestType];

class RouteRegistrar {
    private serv: express.Application;

    constructor(serv: express.Application) {
        // construct this immediately!!!!
        this.serv = serv;
    }

    private defaultHandler(req: express.Request, res: express.Response, callback: RouteCallback, requiredBodyValues?: string[]) {
        if(requiredBodyValues) {
            // checks for required body values if specified
            if(!req.body) return res.status(400).send(generateResponse(false, 'no body brah'));
            for(let i = 0; i < requiredBodyValues.length; i++) {
                // checks each value to see if in body
                let v = requiredBodyValues[i];
                if(!v) return res.status(400).send(generateResponse(false, 'erm'));
                if(!(v in req.body)) return res.status(400).send(generateResponse(false, 'missing body value'));
            }
        }

        // callback if everything succeeds
        callback(req, res);
    }

    private registerRoute({ path, type, callback, requiredBodyValues }: RegistrationProps): boolean {
        console.log(`registered route "${path}" w type ${type.toString()}`);
        // auughh switch case case case
        switch(type) {
            case RequestType.GET: 
                this.serv.router.get(path, (req, res) => this.defaultHandler(req, res, callback, requiredBodyValues));
                break;
            case RequestType.POST: 
                this.serv.router.post(path, (req, res) => this.defaultHandler(req, res, callback, requiredBodyValues));
                break;
            case RequestType.PATCH: 
                this.serv.router.patch(path, (req, res) => this.defaultHandler(req, res, callback, requiredBodyValues));
                break;
            case RequestType.OPTIONS: 
                this.serv.router.options(path, (req, res) => this.defaultHandler(req, res, callback, requiredBodyValues));
                break;
            default: return false;
        }

        return true;
    }

    public async register(path: string, type: RequestType, defCallback: RouteCallback, { adminCallback, requiredBodyValuesDefault, requiredBodyValuesAdmin }: RouteRegisterOptions): Promise<boolean> {
        // setup results (admin is true cuz it may not exec)
        let def_res = false;
        let admin_res = true;
        try {
            def_res = this.registerRoute({ path, type, callback: defCallback, requiredBodyValues: requiredBodyValuesDefault });
            if(adminCallback) admin_res = this.registerAdmin({ path, type, callback: adminCallback, requiredBodyValues: requiredBodyValuesAdmin });
        } catch(e) {
            return Promise.reject(e);
        }

        return def_res && admin_res;
    }

    public async registerDefault({ path, type, callback, requiredBodyValues }: RegistrationProps): Promise<boolean> {
        // error if path starts with /admin
        if(path.startsWith('/admin')) {
            return Promise.reject(`path "${path}" cannot start with /admin`);
        }

        // register route
        return this.registerRoute({ path, type, callback, requiredBodyValues });
    }

    public registerAdmin({ path, type, callback, requiredBodyValues }: RegistrationProps) {
        // just register path with /admin in the front
        return this.registerRoute({ path: `/admin${path}`, type, callback, requiredBodyValues });
    }

    public getServer(): express.Application {
        // pretty self explanatory, dunno why im typing dis out
        return this.serv;
    }
}

export default RouteRegistrar;