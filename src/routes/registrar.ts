import express from 'express';

interface RouteCallback {
    (req: express.Request, res: express.Response): express.Response
}

interface RegistrationProps {
    path: string,
    type: RequestType,
    callback: RouteCallback
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

    private registerRoute({ path, type, callback }: RegistrationProps): boolean {
        console.log(`registered route "${path}" w type ${type.toString()}`);
        // auughh switch case case case
        switch(type) {
            case RequestType.GET: 
                this.serv.router.get(path, callback);
                break;
            case RequestType.POST: 
                this.serv.router.post(path, callback);
                break;
            case RequestType.PATCH: 
                this.serv.router.patch(path, callback);
                break;
            case RequestType.OPTIONS: 
                this.serv.router.options(path, callback);
                break;
            default: return false;
        }

        return true;
    }

    public async register(path: string, type: RequestType, def_callback: RouteCallback, admin_callback?: RouteCallback): Promise<boolean> {
        // setup results (admin is true cuz it may not exec)
        let def_res = false;
        let admin_res = true;
        try {
            def_res = this.registerRoute({path, type, callback: def_callback});
            if(admin_callback) admin_res = this.registerAdmin({path, type, callback: admin_callback});
        } catch(e) {
            return Promise.reject(e);
        }

        return def_res && admin_res;
    }

    public async registerDefault({ path, type, callback }: RegistrationProps): Promise<boolean> {
        // error if path starts with /admin
        if(path.startsWith('/admin')) {
            return Promise.reject(`path "${path}" cannot start with /admin`);
        }

        // register route
        return this.registerRoute({ path, type, callback });
    }

    public registerAdmin({ path, type, callback }: RegistrationProps) {
        // just register path with /admin in the front
        return this.registerRoute({ path: `/admin${path}`, type, callback });
    }

    public getServer(): express.Application {
        // pretty self explanatory, dunno why im typing dis out
        return this.serv;
    }
}

export default RouteRegistrar;