import express from 'express';

class RouteRegistrar {
    private serv: express.Application;

    constructor(serv: express.Application) {
        this.serv = serv;
    }

    public getServer(): express.Application {
        return this.serv;
    }
}

export default RouteRegistrar;